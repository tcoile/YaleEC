import React from "react";
import * as d3 from "d3";
import cloneDeep from "lodash/cloneDeep";
import '../App.css';
import './Data.css'
import { linkVertical } from "d3";
// import Chip from '@material-ui/core/Chip';

class Data extends React.Component {
    constructor(props) {
        super(props);
    }

    async componentDidMount() {
        const data = await this.getData();
        this.buildVisualization(data);
        // const parsedData = this.parseData(data);
        // this.buildVisualization(parsedData);
    }

    async getData() {
        let response = await fetch('/get_organizations', {
            mode: 'cors'
        }).catch(() => console.log("could not fetch organizations"));
        let jsonRes = await response.json().catch(() => console.log("not a valid json thing"));
        return jsonRes;
    }

    parseData(data) {
        // Remove excess white space
        data = data.map((d) => {
            d.tags = d.tags.map((tag) => {
                return tag.trim();
            })
            if (d.tags.length === 0 || d.tags[0] === "") {
                d.tags = ["Not Listed"];
            }
            return d;
        });
        
        let map = {};
        // Further Nesting is possible by recursing on these methods
        let newThing = this.parseDataHelper(data, [], true, map);
        return newThing;
    }

    parseDataHelper(data, ancestralTags, topLevel, supersetMap) {
        // Use d3's methods to manipulate data... 
        // Expand: one row per tag per organization with a new 'key' field
        // but! if it corresponds to the parentKey, we don't want to expand it anymore, but give it the "" key
        const keyedData = [];
        for (let i = 0; i < data.length; i++) {
            const elem = data[i];
            let seenTags = []
            for(let j = 0; j < data[i].tags.length; j++) {
                // if a tag has already been generated, don't do it again
                if(!seenTags.includes(data[i].tags[j])) {
                    // if the tag is the parent's key, we don't want to generate it unless 
                    // it doesn't have any other tags
                    if(!ancestralTags.includes(data[i].tags[j])) {
                        const clonedElem = cloneDeep(elem);
                        clonedElem.key = data[i].tags[j];
                        keyedData.push(clonedElem);
                        seenTags.push(data[i].tags[j]);
                    }
                }
            }
            // if this didn't have any tags other than the parent, then generate it once with the parent tag
            if(seenTags.length === 0) {
                const clonedElem = cloneDeep(elem);
                clonedElem.key = ancestralTags[ancestralTags.length - 1];
                keyedData.push(clonedElem);
            }
        }

        // Collapse: d3.group, then flatten into an array
        const groupedData = d3.group(keyedData, (d) => d.key);
        const groupDataArray = Array.from(groupedData, ([key, value]) => ({ name: key, children: value }));

        let recursiveThreshold = 5;
        this.mergeSupersets(groupDataArray, topLevel, supersetMap);
        // and now we want to cull it so that groups that only have one member are connected directly to the parent again
        // first find the group that only has that tag
        let parentTag = ancestralTags[ancestralTags.length - 1];
        let onlyParentTag = 0;
        if(groupDataArray[onlyParentTag].name !== parentTag) {
            onlyParentTag = -1;
            for(let i = 0; i < groupDataArray.length; i++) {
                if(groupDataArray[i].name === parentTag) {
                    onlyParentTag = i;
                    break;
                }
            }
        }
        for(let i = 0; i < groupDataArray.length; i++) {
            if(groupDataArray[i].children.length === 1 && i !== onlyParentTag) {
                // change key to parent key
                groupDataArray[i].children[0].key = parentTag;
                // put it into the only tag group
                if(onlyParentTag === -1) {
                    groupDataArray.push({name: parentTag, children: []});
                    onlyParentTag = groupDataArray.length - 1;
                }
                groupDataArray[onlyParentTag].children.push(groupDataArray[i].children[0]);
                // then delete that one
                groupDataArray.splice(i, 1);
                if(i < onlyParentTag) {
                    onlyParentTag--;
                }
                i--;
            }
        }

        if(groupDataArray.length > recursiveThreshold) {
            for(let i = 0; i < groupDataArray.length; i++) {
                if(groupDataArray[i].name !== ancestralTags[ancestralTags.length - 1]) {
                    // don't want to do it again for the parent tag itself
                    let newTags = ancestralTags.concat([groupDataArray[i].name])
                    groupDataArray[i].children = this.parseDataHelper(groupDataArray[i].children, newTags, false, supersetMap);
                }
            }
        } 
        
        // and then we want to pull all the ones in the parent tag group to the parent tag itself
        if(onlyParentTag !== -1) {
            let onlyParentArray = groupDataArray[onlyParentTag].children;
            groupDataArray.splice(onlyParentTag, 1);
            // then put all of its children into the parent children
            for(let i = 0; i < onlyParentArray.length; i++) {
                groupDataArray.push(onlyParentArray[i]);
            }
        }

        return groupDataArray;
    }

    /* map takes form of 
    {
        parentName: [child, child, child],
        parentName: [child, child]
    }
    */
    makeSupersetMap(map, parent, child) {
        if(map[parent] === undefined) {
            map[parent] = [child];
        } else {
            map[parent].push(child);
        }
    }
    
    checkSupersetMap(map, parent, child) {
        if(map[parent] === undefined) {
            return true;
        } else if(map[parent].includes(child)) {
            return true;
        }
        return false;
    }

    changeChildKeys(array, key) {
        for(let i = 0; i < array.length; i++) {
            array[i].key = key;
        }
    }

    mergeSupersets(groupDataArray, topLevel, map) {
        // Check for supersets
        let i = 0; 
        while(i < groupDataArray.length - 1) {
            // indicates whether groupDataArray[i] has been deleted because it is contained within another group
            let subsumed = false;
            for(let j = i + 1; j < groupDataArray.length; j++) {
                let smallArrayIndex, largeArrayIndex;
                if(groupDataArray[i].children.length <= groupDataArray[j].children.length) {
                    smallArrayIndex = i;
                    largeArrayIndex = j;
                } else {
                    smallArrayIndex = j;
                    largeArrayIndex = i;
                }
                let smallArray = groupDataArray[smallArrayIndex].children;
                let largeArray = groupDataArray[largeArrayIndex].children;
                // indicates that of the two arrays, i and j, one is the superset of the other
                let smallInLarge = true;
                for(let smallIterator = 0; smallIterator < smallArray.length; smallIterator++) {
                    let smallElementInLarge = false;
                    // for each element in the small array, iterate through the large array
                    // if the element is found, break and set smallElementInLarge to true
                    for(let largeIterator = 0; largeIterator < largeArray.length; largeIterator++) {
                        if(smallArray[smallIterator].name === largeArray[largeIterator].name) {
                            smallElementInLarge = true;
                            break;
                        }
                    }
                    // smallInLarge takes the result of each individual element and &'s them together
                    // if any one element is not found, break
                    smallInLarge = smallElementInLarge;
                    if(!smallInLarge) {
                        break;
                    }
                }
                // if the smaller array is a subset of the larger array
                // remove the smaller array; if the smaller array is i (smaller index) 
                // delete it and continue to the next iteration of the while loop
                // if the smaller is array is j (larger index), delete it
                // continue to next iteration of the for loop, adjusting j
                if(smallInLarge) {
                    // if toplevel is true, note the parent and child
                    let parent = groupDataArray[largeArrayIndex].name;
                    let child = groupDataArray[smallArrayIndex].name;
                    if(topLevel) {
                        this.makeSupersetMap(map, parent, child);
                    } else {
                        let superset = this.checkSupersetMap(map, parent, child);
                        if(smallArray.length === largeArray.length) {
                            if(superset) {
                                // if superset and same size, choose more specific tag
                                groupDataArray[largeArrayIndex].name = child;
                                this.changeChildKeys(largeArray, child);
                            } else {
                                // combine their names
                                groupDataArray[largeArrayIndex].name = parent + "/" + child;
                                this.changeChildKeys(largeArray, parent + "/" + child);
                            }
                        } else {
                            if(!superset) {
                                // if the ratio is greater than 1/3, combine their names
                                if(1/(smallArray.length / largeArray.length) < 3) {
                                    groupDataArray[largeArrayIndex].name = parent + "/" + child;
                                    this.changeChildKeys(largeArray, parent + "/" + child);
                                }
                            }
                        }
                    }

                    groupDataArray.splice(smallArrayIndex, 1);
                    if(smallArrayIndex < largeArrayIndex) {
                        subsumed = true;
                        break;
                    } else {
                        j--;
                    }
                }
            }
            // if array i was not deleted this time around, increment i
            if(!subsumed) {
                i++;
            }
        }
        // directly modifies the array given to it
        return;
    }

    /**
     * Visualization! We're building this visualization in the MOST d3 way, 
     * the LEAST React way possible
     */
    buildVisualization(data) {
        /**
         * Get nodes and links
         */
    
        const root = d3.hierarchy({name: 'everything', children: data});

        // Adds an identity field to each node - useful for data joins
        // Also adds a cluster ID to each node - useful for blobs
        function flatten(root) {
            let clusters = [], i = 0, cluster = 0;
        
            function recurse(node) {
                if (node.children) {
                    node.children.forEach(recurse);
                }
                if (!node.identity) node.identity = ++i;
            }

            function recurseCluster(node) {
                if(node.children) {
                    node.children.forEach(recurseCluster);
                }
                node.cluster = cluster;
                if(clusters[cluster] === undefined) {
                    clusters[cluster] = [];
                }
                clusters[cluster].push(node);
            }
        
            recurse(root);
            root.children.forEach((child) => {
                recurseCluster(child);
                cluster++;
            })
            return clusters;
        }

        const clusters = flatten(root)
        console.log(clusters);

        function getLinks() { // remove links from root to all children
            const links = root.links();
            // if link.source.identity == root.identity, delete this link
            while(links[0].source.identity === root.identity) {
                links.shift();
            }
            return links;
        }

        function getNodes() { // remove everything node
            const nodes = root.descendants();
            nodes.shift();
            return nodes;
        }

        let links = getLinks();
        let nodes = getNodes();

        /**
         * Create force simulation, color schemes, and overall svg
         */
        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.identity)
                .distance((d) => (d.target.children || d.target._children) ? 20 : 10)
                .strength(1.6))
            .force("charge", d3.forceManyBody().strength((d) => {
                return d.children || d._children ? -200 : -60;
            }))
            .force("x", d3.forceX())
            .force("y", d3.forceY())

        const color = d3.scaleOrdinal()
            .domain(data, (d) => d.name) 
            .range(d3.schemeTableau10);

        // Enable zooming, panning
        function zoomed({transform}) {
            // console.log(transform)
            currentScale = transform.k
            forcePlot.attr("transform", transform);
        }

        let currentScale = 1;

        const zoom = d3.zoom()
            .scaleExtent([0.3, 10])
            .on("zoom", zoomed);

        const width = 1000;
        const height = 490;
    
        const forceSvg = d3.select(this._rootNode)
            .append('svg')
            .attr('id', 'force-svg')
            .attr('viewBox', [0, 0, width, height])
            .attr("preserveAspectRatio", "xMidYMid meet")
            .call(zoom);
        
        const forcePlot = forceSvg.append('g')

        forceSvg.call(zoom.translateTo,
            650,
            450); // note? WHY???? 
        forceSvg.transition().duration(400).call(
            zoom.scaleTo,
            0.3);    
        /**
         * Interactivity
         */
        
        // drag interactions
        const drag = simulation => {
            function dragstarted(event, d) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }

            function dragged(event, d) {
                d.fx = event.x;
                d.fy = event.y;
            }
              
            function dragended(event, d) {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }
              
            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }

        const {selectClub} = this.props;
        // Click interactions
        async function click(event, d) {
            if (event.defaultPrevented) return; // ignore drag
            // handles tag actions
            if (d.children) { // make them disappear
              d._children = d.children;
              d.children = null;
            } else if (d._children) { // make them appear, if not a leaf
              centerElement(event, this, 4);
              d.children = d._children;
              d.children.map((node) => { // make children appear in the right place
                  let delta_x = 0;
                  let slope = 1;
                  if (node.parent !== null && node.parent.parent !== null && node.parent.parent.identity !== root.identity) { // have a grandparent?
                    // travel a bit in the rough direction of the line our parent/grandparent make
                    delta_x = node.parent.x - node.parent.parent.x;
                    const delta_y = node.parent.y - node.parent.parent.y;
                    slope = delta_y / delta_x;
                  }
                  node.x = node.parent.x + delta_x * 3/4 + Math.random() * 10;
                  node.y = node.parent.y + slope * delta_x * 3/4 + Math.random() * 10;
                  return node;
              })
              d._children = null;
            } else { // handles leaf actions
                positionLeaf(event, this);
                const tagColors = d.data.tags.map((tag) => color(tag));
                const newData = {...d.data, colors: tagColors};
                selectClub(newData);
            }
            
        
            update(); // update forces some data joins, then restarts the vis
        }

        // update nodes, links, then restart visualization
        function update() {

            nodes = getNodes();
            links = getLinks();

            link = link.data(links, d => [d.source, d.target])
                .join('line');

            node = node.data(nodes, d => d.identity)
                .join('circle')
                    .attr('fill', (d) =>  d.children || d._children ? null : color(d.data.key))
                    .attr('stroke', (d) => d.children || d._children ? color(d.data.name) : '#fff')
                    .attr('stroke-width', (d) => d.children || d._children ? 2 : 1)
                    .attr('r',  (d) => d.children || d._children ? 7 : 6)
                    .on('click', click)
                    .on('mouseover', handleMouseOver)
                    .on('mouseout', handleMouseOut)
                    .call(drag(simulation));
            
            node.append("title")
                .text(d => d.data.name);
            
            simulation.nodes(nodes);
            simulation.force("link").links(links);
            simulation.restart();
        } 

        // hover interactions
        const tooltip = d3.select(this._rootNode).append('div')
            .attr('class', 'hidden tooltip');

        function handleMouseOver(event, node) {
            tooltip.classed('hidden', false)
                .attr('style', 'left:' + (event.clientX + 10*currentScale) + 'px; top:' + (event.clientY - 100) + 'px')
                .html(`<p>${node.data.name}</p>`);

            d3.select(this).transition()
                .duration(150)
                .attr('r', (d) => d.children || d._children ? 10 : 8);
        }

        function handleMouseOut() {
            tooltip.classed('hidden', true);
            d3.select(this).transition()
                .delay(30)
                .duration(200)
                .attr('r', (d) => d.children || d._children ? 7 : 6);
        }

        // BLOB ME UP
        const groupPath = function(d) {
            const hull = d3.polygonHull(d.map((node) => [node.x, node.y]))
            return hull;
        };

        function getCentroid(element) {
            const bbox = element.getBBox();
            return [bbox.x + bbox.width/2, bbox.y + bbox.height/2];
        }

        async function positionLeaf(event, element) {
            event.stopPropagation();
            let x, y;
            const center = getCentroid(element)
            x = center[0];
            y = center[1];
            // center element
            await forceSvg.transition().duration(650).call(
                zoom.translateTo,
                x,
                y).end()
            // zoom it
            await forceSvg.transition().duration(400).call(zoom.scaleTo, 3).end()
            // move it
            x += width/(currentScale*2.5)
            forceSvg.transition().duration(650).call(
                zoom.translateTo,
                x, 
                y
            )
        }

        async function centerElement(event, element, k) {
            event.stopPropagation();
            let x, y;
            
            const center = getCentroid(element);
            x = center[0];
            y = center[1];
              
            await forceSvg.transition().duration(650).call(
                zoom.translateTo,
                x,
                y).end();
            await forceSvg.transition().duration(400).call(
                zoom.scaleTo,
                k
            ).end();
        }

        function centerZoomBlob(event) {
            centerElement(event, this, 1);
        }

        // tick interactions
        simulation.on('tick', () => {
            link.attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);
            node.attr('cx', d => d.x)
                .attr('cy', d => d.y)
            
            convexHull.data(clusters)
                .join('path')
                .attr('d', (d) => {
                    const points = groupPath(d);
                    return smoothHull(points);
                })
                .attr('fill', (d, i) => color(data[i].name))
                .attr('stroke', 'white')
                .attr('stroke-width', 0.2)
                .attr('stroke-linejoin', 'round')
                .attr('opacity', 0.08)
                .on('click', centerZoomBlob);

            forceSvg.attr('viewBox', [-window.innerWidth/2, -window.innerHeight/2, window.innerWidth, window.innerHeight])
        })

        /**
         * Functions that are magical, and which I do not fully understand
         * but am using because I WANT THE PRETTY: 
         * http://bl.ocks.org/hollasch/9d3c098022f5524220bd84aae7623478
         */
        const hullPadding = 40;

        // Point/Vector Operations

        const vecFrom = function (p0, p1) {               // Vector from p0 to p1
            return [ p1[0] - p0[0], p1[1] - p0[1] ];
        }

        const vecScale = function (v, scale) {            // Vector v scaled by 'scale'
            return [ scale * v[0], scale * v[1] ];
        }

        const vecSum = function (pv1, pv2) {              // The sum of two points/vectors
            return [ pv1[0] + pv2[0], pv1[1] + pv2[1] ];
        }

        const vecUnit = function (v) {                    // Vector with direction of v and length 1
            var norm = Math.sqrt (v[0]*v[0] + v[1]*v[1]);
            return vecScale (v, 1/norm);
        }

        const vecScaleTo = function (v, length) {         // Vector with direction of v with specified length
            return vecScale (vecUnit(v), length);
        }

        const unitNormal = function (pv0, p1) {           // Unit normal to vector pv0, or line segment from p0 to p1
            if (p1 != null) pv0 = vecFrom (pv0, p1);
            var normalVec = [ -pv0[1], pv0[0] ];
            return vecUnit (normalVec);
        };


        // Hull Generators

        const lineFn = d3.line()
            .curve (d3.curveCatmullRomClosed)
            .x (function(d) { return d.p[0]; })
            .y (function(d) { return d.p[1]; });


        const smoothHull = (polyPoints) => {
            // Returns the SVG path data string representing the polygon, expanded and smoothed.
            if(polyPoints === null) {
                return;
            }
            const pointCount = polyPoints.length;

            // Handle special cases
            if (!polyPoints || pointCount < 1) return "";
            if (pointCount === 1) return smoothHull1 (polyPoints);
            if (pointCount === 2) return smoothHull2 (polyPoints);

            const hullPoints = polyPoints.map (function (point, index) {
                var pNext = polyPoints[(index + 1) % pointCount];
                return {
                    p: point,
                    v: vecUnit (vecFrom (point, pNext))
                };
            });

            // Compute the expanded hull points, and the nearest prior control point for each.
            for (let i = 0;  i < hullPoints.length;  ++i) {
                const priorIndex = (i > 0) ? (i-1) : (pointCount - 1);
                const extensionVec = vecUnit (vecSum (hullPoints[priorIndex].v, vecScale (hullPoints[i].v, -1)));
                hullPoints[i].p = vecSum (hullPoints[i].p, vecScale (extensionVec, hullPadding));
            }

            return lineFn (hullPoints);
        }


        const smoothHull1 = function (polyPoints) {
            // Returns the path for a circular hull around a single point.

            const p1 = [polyPoints[0][0], polyPoints[0][1] - hullPadding];
            const p2 = [polyPoints[0][0], polyPoints[0][1] + hullPadding];

            return 'M ' + p1
                + ' A ' + [hullPadding, hullPadding, '0,0,0', p2].join(',')
                + ' A ' + [hullPadding, hullPadding, '0,0,0', p1].join(',');
        };


        const smoothHull2 = function (polyPoints) {
            // Returns the path for a rounded hull around two points.

            const v = vecFrom (polyPoints[0], polyPoints[1]);
            const extensionVec = vecScaleTo(v, hullPadding);

            const extension0 = vecSum (polyPoints[0], vecScale(extensionVec, -1));
            const extension1 = vecSum (polyPoints[1], extensionVec);

            const tangentHalfLength = 1.2 * hullPadding;
            const controlDelta    = vecScaleTo (unitNormal(v), tangentHalfLength);
            const invControlDelta = vecScale (controlDelta, -1);

            const control0 = vecSum (extension0, invControlDelta);
            const control1 = vecSum (extension1, invControlDelta);
            const control3 = vecSum (extension0, controlDelta);

            return 'M ' + extension0
                + ' C ' + [control0, control1, extension1].join(',')
                + ' S ' + [          control3, extension0].join(',')
                + ' Z';
        };


        /**
         * Visualization initialization
         */

        let convexHull = forcePlot.selectAll('.blob')
            .data(clusters)
            .join('path')
            .attr('class', 'hull');

        let link = forcePlot.append('g')
                .attr('stroke', '#999')
                .attr('stroke-opacity', 0.6)
            .selectAll('line')
            .data(links, (d) => [d.source, d.target])
            .join('line');

        let node = forcePlot.append('g')
                .attr('fill', '#fff')
                .attr('stroke', '#000')
                .attr('stroke-width', 1.5)
            .selectAll('circle')
            .data(nodes, d => d.identity)
            .join('circle')
                .attr('fill', (d) => d.children || d._children ? null : color(d.data.key))
                .attr('stroke', d => d.children || d._children ? color(d.data.name) : '#fff')
                .attr('stroke-width', (d) => d.children || d._children ? 2 : 1)
                .attr('r', (d) => d.children || d._children ? 7 : 6)
                .on("click", click)
                .on('mouseover', handleMouseOver)
                .on('mouseout', handleMouseOut)
                .call(drag(simulation))

        node.append("title")
            .text(d => d.data.name);

    }

    shouldComponentUpdate() {
        return false;
    }

    _setRef(componentNode) {
        this._rootNode = componentNode;
    }

    render() {
        return <div className="line-container" ref={this._setRef.bind(this)} />
    }
}

export default Data;