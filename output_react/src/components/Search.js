import React from 'react'
import { withStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import * as d3 from "d3";

import Dialog from '@material-ui/core/Dialog';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';

import Clubpage from './Clubpage';
import './Search.css'
import { color } from 'd3';

const drawerWidth = 45;
const width = 1280;
const height = 550;
const averageRadius = 5;

const tags = ['AACC Affiliate Org', 
    'Academic', 
    'Administrative', 
    'Advocacy/Policy', 
    'AfAm Affiliate Org', 
    'Arts', 
    'Visual Arts',
    'Cultural',
    'Mixed Race',
    'Entrepreneurial/Business',
    'Food/Culinary',
    'Funding',
    'Games/Gaming',
    'Greek-Letter Organizations',
    'Health/Wellness',
    'International Affairs',
    'La Casa Affiliate Org',
    'Leadership',
    'LGBTQ',
    'Media/Technology',
    'Medical/Nursing/Public Health',
    'NACC Affiliate Org',
    'OISS Affiliate Org',
    'Performance',
    'Comedy',
    'Dance',
    'Instruments',
    'Other',
    'Singing',
    'Theater',
    'Political',
    'Pre-Professional',
    'Professional',
    'Publication',
    'Religious/Spiritual',
    'Science/Technology',
    'Service/Volunteering',
    'Social',
    'Special Interest',
    'Speech/Debate',
    'Sports/Outdoors',
    'Student Government',
    'Veteran/Military']

const MenuProps = {
    PaperProps: {
        style: {
            width: 400,
        },
    },
};

const styles = theme => ({
    horiFlex: {
    
    },
    searchDiv: {
        paddingTop: 20,
        paddingBottom: 20,
        marginLeft: 20,
        paddingLeft: 20,
        paddingRight: 20,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center'
    },
    searchInput: {
        fontSize: 20,
    },
    drawer: {
        width: `${drawerWidth}%`,
        flexShrink: 0,
        zIndex: theme.zIndex.appBar - 1,
        display: 'flex',
        justifyContent: 'center',
        alignContent: 'center'
    },
    drawerPaper: {
        width: `${drawerWidth}%`,
        paddingTop: 60,
        zIndex: theme.zIndex.appBar - 1,
    },
    drawerHeader: {
        display: 'flex',
        alignItems: 'flex-end',
        alignContent: 'flex-end',
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
        justifyContent: 'flex-start',
    },
    drawerMain: {
        marginLeft: 30,
        marginRight: 30,
        marginBottom: 30
    },
    dialogPaper: {
        maxWidth: 800,
        minWidth: 800
    }
})

class Search extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            searchTerm: "",
            tags: [],
            clubInfo: undefined,
            simulation: null,
            color: null,
            node: null,
            parsedData: null,
            svg: null
        };
    }

    handleMouseOver(event, data) {
        const xPos = parseFloat(d3.select(this).attr('cx')) + width/2;
        const yPos = parseFloat(d3.select(this).attr('cy')) + height/2;
        d3.select('#search-tooltip')
            .style('top', `${yPos}px`)
            .style('left', () => {
                if (xPos <= width/2) {
                    return '';
                } return `${xPos}px`})
            .style('right', () => {
                if (xPos > width/2) {
                    return '';
                } return `${width - xPos}px`
            })
            .html(`<p>${data.name}</p>`)
            .classed('hidden', false);
    }

    handleMouseOut() {
        d3.select('#search-tooltip')
            .classed('hidden', true);
    }

    async handleClick(event, data){
        console.log(data);
        console.log(this)
        this.state.node.transition()
            .duration(750)
            .attr('fill', (d) => (d.name === data.name) ? d3.rgb(d.key).darker(1) : d3.rgb(d.key))
            .attr('r', (d) => (d.name === data.name) ? d.radius + 1 : d.radius);
        
        this.selectClub(data);
    }

    async componentDidMount() {
        const data = await this.getData();
        // this.buildVisualization(data);
        const parsedData = this.parseData(data);
        parsedData.forEach((d) => d.radius = averageRadius + Math.random()*2);
        
        const color = d3.scaleOrdinal()
            .domain(parsedData, (d) => d.name)
            .range(d3.schemeTableau10);

       
        const svg = d3.select('#search-viz').append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${width/2}, ${height/2})`);
        
        const simulation = d3.forceSimulation(parsedData)
            .force("charge", d3.forceManyBody().strength(-14))
            .force('collision', d3.forceCollide().radius(averageRadius + 3))
            .force("x", d3.forceX())
            .force("y", d3.forceY())
            .alpha(0.2);

        const node = svg.selectAll('circle')
            .data(parsedData, (d) => d.name)
            .join('circle')
            .attr('fill', (d) => color(d.name))
            .attr('r', (d) => d.radius)
            .on('mouseover', this.handleMouseOver)
            .on('mouseout', this.handleMouseOut)
            .on('click', this.handleClick.bind(this));

        simulation.on('tick', () => {
            svg.selectAll('circle')
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)
        })

        for(let i = 0; i < parsedData.length; i++) {
            let colors = [];
            for(let j = 0; j < parsedData[i].tags.length; j++) {
                colors.push(color(parsedData[i].tags[j]));
            }
            parsedData[i].colors = colors;
            parsedData[i].key = color(parsedData[i].name);
        }

        this.setState({svg: svg});
        this.setState({parsedData: parsedData})
        this.setState({simulation: simulation});
        this.setState({node: node});
        this.setState({color: color});
    };

    updateCircles(searchTerm, tagStrings) {
        console.log(tagStrings);
        const newData = this.state.parsedData.filter((d) => {
            const nameIncludes = d.name.toLowerCase().search(searchTerm.toLowerCase()) !== -1
            let tagIncludes = 1;
            console.log(tagStrings.length)
            for (let i = 0; i < tagStrings.length; i++) {
                console.log(d.tags);
                console.log(tagStrings[i]);
                console.log(d.tags.includes(tagStrings[i]));
                tagIncludes = d.tags.includes(tagStrings[i]);
                if (!tagIncludes) {
                    break;
                }
            }
            return nameIncludes && tagIncludes;
        });

        const node = this.state.svg.selectAll('circle')
            .data(newData, (d) => d.name)
            .join('circle')
            .attr('fill', (d) => this.state.color(d.name))
            .attr('r', (d) => d.radius)
            .on('mouseover', this.handleMouseOver)
            .on('mouseout', this.handleMouseOut)
            .on('click', this.handleClick.bind(this));

        this.setState({node: node});
        this.state.simulation.nodes(newData);
        this.state.simulation.alpha(0.3).restart();

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
        
        return data;
    }

    handleChange = (event) => {
        this.setState({searchTerm: event.target.value});
        this.updateCircles(event.target.value, this.state.tags);
    }

    handleTagChange = (event, value) => {
        this.setState({tags: value});
        this.updateCircles(this.state.searchTerm, value);
    }
    
    handleDrawerOpen () {
        this.setState({open: true});
      };
    
    handleDrawerClose = () => {
        this.setState({open: false});
    };

    selectClub = (value) => {
        this.setState({clubInfo: value})
        this.handleDrawerOpen();
    };

    render() {
        const { classes } = this.props;
        const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
        const checkedIcon = <CheckBoxIcon fontSize="small" />;
        return (
            <div>
                <CssBaseline/>
                    <div className={classes.searchDiv}>
                        <TextField 
                            id="search" 
                            size="medium" 
                            variant="standard"
                            label="What are you looking for?"
                            style={{width: '40%', marginRight: 20}}
                            onChange={this.handleChange}
                            ></TextField>
                        {/* <Select
                            label="Filter by tags"
                            id="demo-mutiple-checkbox"
                            multiple
                            value={this.state.tags}
                            onChange={this.handleTagChange}
                            input={<Input />}
                            renderValue={(selected) => selected.join(', ')}
                            MenuProps={MenuProps}
                            style={{width: '40%', marginTop: 15}}
                            >
                            {tags.map((tag) => (
                                <MenuItem key={tag} value={tag}>
                                <Checkbox checked={this.state.tags.indexOf(tag) > -1} />
                                <ListItemText primary={tag} />
                                </MenuItem>
                            ))}
                        </Select> */}
                        <Autocomplete
                            multiple
                            options={tags}
                            disableCloseOnSelect
                            onChange={this.handleTagChange}
                            renderOption={(tag, { selected }) => (
                                <React.Fragment>
                                <Checkbox
                                    icon={icon}
                                    checkedIcon={checkedIcon}
                                    style={{ marginRight: 8 }}
                                    checked={selected}
                                />
                                {tag}
                                </React.Fragment>
                            )}
                            style={{ width: 500 }}
                            renderInput={(params) => (
                                <TextField {...params} variant="standard" label="Filter by tags" />
                            )}
                        />
                    </div>
                        <div id="search-viz" style={{position: 'relative', width: width}}>
                            <div id="search-tooltip" class="search-tooltip hidden"></div>
                        </div>
                {/* <Drawer
                    className={classes.drawer}
                    variant="persistent"
                    anchor="right"
                    open={true}
                    classes={{
                        paper: classes.drawerPaper,
                    }}
                >
                    {this.state.clubInfo ? <Clubpage closeable={false} handleDrawerClose={this.handleDrawerClose} clubInfo={this.state.clubInfo}/> : <p> select a club to see more information </p>}
                </Drawer> */}
                <Dialog open={this.state.open} classes={{
                        paper: classes.dialogPaper,
                    }}>
                    {/* <Paper className={classes.modalPaper}> */}
                        {this.state.clubInfo ? <Clubpage closeable={false} handleDrawerClose={this.handleDrawerClose} clubInfo={this.state.clubInfo}/> : <p> select a club to see more information </p>}
                    {/* </Paper> */}
                </Dialog>
            </div>
        )
    }
}

export default withStyles(styles, {withTheme: true})(Search);