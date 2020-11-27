import React from "react";
import * as d3 from "d3";
import cloneDeep from "lodash/cloneDeep";
// import Chip from '@material-ui/core/Chip';

class Data extends React.Component {

    async componentDidMount() {
        console.log("component mounting"); // looks like this happens twice - why?
        const data = await this.getData();
        // console.log(data);
        const parsedData = this.parseData(data);
        this.buildVisualization(parsedData);
    }

    async getData() {
        console.log("getting response");
        let response = await fetch('/get_organizations', {
            mode: 'cors'
        }).catch(() => console.log("could not fetch organizations"));
        console.log(response);
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
        console.log(map);
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
        // console.log(groupedData);
        // console.log(groupDataArray);

        let recursiveThreshold = 5;
        let unNestThreshold = 1;
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
            if(groupDataArray[i].children.length === 1) {
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
                            } else {
                                // combine their names
                                groupDataArray[largeArrayIndex].name = parent + "/" + child;
                            }
                        } else {
                            if(!superset) {
                                // if the ratio is greater than 1/3, combine their names
                                if(1/(smallArray.length / largeArray.length) < 3) {
                                    groupDataArray[largeArrayIndex].name = parent + "/" + child;
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
     * We're building this visualization in the MOST d3 way, 
     * the LEAST React way possible
     * 
     */
    buildVisualization(data) {
        console.log(data);
        // transform data into a list of nodes and directed edges (from parent to child)
        const dat = {name: 'Yale ECs', children: data}
        // const dat = data[27];

        const root = d3.hierarchy(data[10]);
        console.log(root);
        // Returns a list of all nodes under the root.
        function flatten(root) {
            var nodes = [], i = 0;
        
            function recurse(node) {
                if (node.children) node.children.forEach(recurse);
                if (!node.identity) node.identity = ++i;
                nodes.push(node);
            }
        
            recurse(root);
            return nodes;
        }

        let links = root.links();
        let nodes = flatten(root);

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(0).strength(1))
            .force("charge", d3.forceManyBody().strength(-50))
            .force("x", d3.forceX())
            .force("y", d3.forceY())

        const width = 1000;
        const height = 1000;

        const forcePlot = d3.select(this._rootNode)
            .append('svg')
            .attr('viewBox', [-width/2, -height/2, width, height])
        
        let link = forcePlot.append('g')
                .attr('stroke', '#999')
                .attr('stroke-opacity', 0.6)
            .selectAll('line')
            .data(links)
            .join('line');
        
        // add interactivity
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

        // Add click interactivity
        function click(event, d) {
            if (event.defaultPrevented) return; // ignore drag
            console.log(d);
            if (d.children) {
              d._children = d.children;
              d.children = null;
            } else {
              d.children = d._children;
              d._children = null;
            }
            console.log(d);
            console.log(root.descendants());
            update();
        }

        function update() {
            nodes = root.descendants();
            links = root.links();
            console.log(nodes);
            
            // Make a shallow copy to protect against mutation, while
            // recycling old nodes to preserve position and velocity.
            const old = new Map(node.data().map(d => [d.identity, d]));
            nodes = nodes.map(d => Object.assign(old.get(d.identity) || {}, d));
            links = links.map(d => Object.assign({}, d));

            link = link.data(links, d => [d.source, d.target])
                .join('line');
            node = node.data(nodes, d => d.identity);

            node.exit().remove();

            node.enter()
                .append('circle')
                .attr('fill', (d) => {
                    console.log('entering' + d.identity);
                    return 'blue'
                })
                .attr('stroke', d => d.children || d._children ? null : '#fff')
                .attr('r', 3.5)
                .on("click", click)
                .call(drag(simulation));
            
            simulation.nodes(nodes);
            simulation.force("link").links(links);
            simulation.restart();
        } 

        let node = forcePlot.append('g')
                .attr('fill', '#fff')
                .attr('stroke', '#000')
                .attr('stroke-width', 1.5)
            .selectAll('circle')
            .data(nodes, d => d.identity)
            .join('circle')
                .attr('fill', (d) => d.children || d._children ? null : '#000')
                .attr('stroke', d => d.children || d._children ? null : '#fff')
                .attr('r', 3.5)
                .on("click", click)
                .call(drag(simulation))

        node.append("title")
            .text(d => d.data.name);

        // update on tick
        simulation.on('tick', () => {
            link.attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);
            node.attr('cx', d => d.x)
                .attr('cy', d => d.y)
        })
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