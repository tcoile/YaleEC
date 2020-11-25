import React from "react";
import * as d3 from "d3";
import {db} from "../firebase";
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
        console.log(data);
        // TODO: create a method that nests recursively on some stopping condition
        // Further Nesting is possible by recursing on these methods 

        // Use d3's methods to manipulate data... 
        // Expand: one row per tag per organization with a new 'key' field
        const keyedData = [];
        for (let i = 0; i < data.length; i++) {
            const elem = data[i];
            for(let j = 0; j < data[i].tags.length; j++) {
                const clonedElem = cloneDeep(elem);
                clonedElem.key = data[i].tags[j];
                keyedData.push(clonedElem);
            }
        }
        console.log(keyedData);

        // Collapse: d3.group, then flatten into an array
        const groupedData = d3.group(keyedData, (d) => d.key);
        const groupDataArray = Array.from(groupedData, ([key, value]) => ({ key, value }));
        console.log(groupedData);
        console.log(groupDataArray);
        // TODO: Check for supersets
        // groupDataArray.forEach((group) => {

        // })
        return groupDataArray;
    }

    /**
     * We're building this visualization in the MOST d3 way, 
     * the LEAST React way possible
     * 
     * For now, following a scheme like this: https://bl.ocks.org/ctufts/f38ef0187f98c537d791d24fda4a6ef9 
     */
    buildVisualization(data) {
        console.log(data);

        // within each cluster, 

        // for names, append them over the top...
        d3.select(this._rootNode)
            .append('div')
            .text('hello, world')
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

    // render() {
    //     const orgs = this.state.organizations;
    //     return(
    //         <div>
    //             {orgs.map(org => (
    //                 <div key={org.name}>
    //                     <p> {org.name} </p>
    //                     {org.tags.map(tag => (
    //                         <Chip key={Math.random()} label={tag} color='secondary' />
    //                     ))}
    //                 </div>
    //             ))}
    //         </div>
    //     )
    // }
}

export default Data;