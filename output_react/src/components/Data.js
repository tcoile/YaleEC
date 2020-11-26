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
        let response = await fetch('/get_organizations').catch(() => console.log("could not fetch organizations"));
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
        
        // Further Nesting is possible by recursing on these methods
        let newThing = this.parseDataHelper(data, []);
        return newThing;
    }

    parseDataHelper(data, ancestralTags) {
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
            // if this didn't have any tags other than the parent, then generate it once
            if(seenTags.length == 0) {
                const clonedElem = cloneDeep(elem);
                clonedElem.key = "";
                keyedData.push(clonedElem);
            }
        }

        // Collapse: d3.group, then flatten into an array
        const groupedData = d3.group(keyedData, (d) => d.key);
        const groupDataArray = Array.from(groupedData, ([key, value]) => ({ key, value }));
        // console.log(groupedData);
        // console.log(groupDataArray);

        let recursiveThreshold = 5;
        let unNestThreshold = 1;
        if(groupDataArray.length > recursiveThreshold) {
            this.mergeSupersets(groupDataArray);
            for(let i = 0; i < groupDataArray.length; i++) {
                if(groupDataArray[i].key !== "") {
                    let newTags = ancestralTags.concat([groupDataArray[i].key])
                    groupDataArray[i].value = this.parseDataHelper(groupDataArray[i].value, newTags);
                }
                // this is the group with no other tags besides the parent
            }
        } 
        return groupDataArray;
    }

    mergeSupersets(groupDataArray) {
        // Check for supersets
        let i = 0; 
        while(i < groupDataArray.length - 1) {
            // indicates whether groupDataArray[i] has been deleted because it is contained within another group
            let subsumed = false;
            for(let j = i + 1; j < groupDataArray.length; j++) {
                let smallArrayIndex, largeArrayIndex;
                if(groupDataArray[i].value.length <= groupDataArray[j].value.length) {
                    smallArrayIndex = i;
                    largeArrayIndex = j;
                } else {
                    smallArrayIndex = j;
                    largeArrayIndex = i;
                }
                let smallArray = groupDataArray[smallArrayIndex].value;
                let largeArray = groupDataArray[largeArrayIndex].value;
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
                    groupDataArray.splice(smallArrayIndex, 1);
                    if(smallArrayIndex < largeArrayIndex) {
                        subsumed = true;
                        break;
                    } else {
                        j--;
                    }
                    console.log(smallArrayIndex, largeArrayIndex);
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
     * For now, following a scheme like this: https://bl.ocks.org/ctufts/f38ef0187f98c537d791d24fda4a6ef9 
     */
    buildVisualization(data) {
        // transform data into a list of nodes and directed edges (from parent to child)
        const fakeData = {
            key: 'everything',
            value: [
            {
                key: 'topic1',
                value: [
                    {name: 'club1top1', key: 'topic1'},
                    {
                        key: 'subtopic2',
                        value: [
                            {name: 'club2top1subtop2', key: 'subtopic2'},
                            {name: 'club5top1subtop2', key: 'subtopic2'},
                            {name: 'club6top1subtop2', key: 'subtopic2'},
                            {name: 'club7top1subtop2', key: 'subtopic2'}
                        ]
                    },
                    {name: 'club3top1', key: 'topic1'},
                    {name: 'club4top1', key: 'topic1'},
                ] 
            },
            {
                key: 'topic2',
                value: [
                    {name: 'club1top2'},
                    {
                        key: 'subtopic2',
                        value: [
                            {name: 'club2top2subtop2'},
                            {name: 'club5top2subtop2'},
                            {name: 'club6top2subtop2'},
                            {name: 'club7top2subtop2'}
                        ]
                    },
                    {name: 'club3top2'},
                    {name: 'club4top2'},
                ] 
            }
        ]}

        let nodeCount = 0;
        // TODO: these functions
        function nodesAndEdges(tree, nodeList, edgeList, parentID) {
            // if leaf, append self to nodelist
            if ('name' in tree) {
                const leaf = {...tree, id: nodeCount};
                nodeCount++;
                nodeList.push(leaf);
                edgeList.push({source: parentID, target: leaf.id});
            } else { // append self to nodelist, call getNodes on each child
                const node = {...tree, id: nodeCount};
                nodeCount++;
                nodeList.push(node);
                if(parentID !== undefined) {
                    edgeList.push({source: parentID, target: node.id});
                }
                tree.value.forEach((child) => {
                    nodesAndEdges(child, nodeList, edgeList, node.id);
                })
            }
        }

        let nodeList = [];
        let edgeList = [];
        nodesAndEdges(fakeData, nodeList, edgeList, undefined);

        // create constrained force layout with nodes and edges
        // set up workspace
        const margin = {
            top: 60,
            bottom: 60,
            right: 60,
            left: 60,
        };
        
        const height = 700 - margin.top - margin.bottom;
        const width = 700 - margin.top - margin.bottom;

        const forcePlot = d3.select(this._rootNode)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);
        
        const force = d3.forceSimulation(nodeList)
            .force('charge', d3.forceManyBody()
              .strength(-70))
            .force('link', d3.forceLink(edgeList)
              .distance(150))
            .force('center', d3.forceCenter().x(width / 2).y(height / 2));
        
        const edges = forcePlot.selectAll('line')
            .data(edgeList)
            .enter()
            .append('line')
            .style('stroke', 'black')
            .attr('stroke-opacity', 0.1)
            .style('stroke-width', 1);
      
        const nodes = forcePlot.selectAll('circle')
            .data(nodeList)
            .enter()
            .append('circle')
            .attr('r', 6)
            .attr('fill', 'blue');

        const labels = forcePlot.selectAll('text')
            .data(nodeList)
            .enter()
            .append('text')
            .attr('font-family', 'sans-serif')
            .attr('font-size', 'small')
            .text((d) => d.name)
            .style('pointer-events', 'none');

        force.on('tick', () => {
            edges.attr('x1', (d) => d.source.x)
                .attr('y1', (d) => d.source.y)
                .attr('y2', (d) => d.target.y)
                .attr('x2', (d) => d.target.x);
            nodes.attr('cx', (d) => d.x)
                .attr('cy', (d) => d.y);
            labels.attr('x', (d) => d.x + 4)
                .attr('y', (d) => d.y - 4);
        });
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