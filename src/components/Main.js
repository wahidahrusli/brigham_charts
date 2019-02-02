import React, {Component} from 'react';
import SingleChart from './charts/SingleChart';
import GanttChart from './charts/GanttChart';
import {select, event, selectAll} from "d3-selection";
import {zoom, zoomIdentity} from "d3-zoom";
import {scaleLinear, scaleOrdinal} from "d3-scale";
import {axisBottom, axisLeft} from "d3-axis";

class Main extends Component{

	render(){
		return(
			<div>
				{/*<div class="bar-chart"/>*/}
				<GanttChart/>
                <br/>
                <SingleChart/>
                
			</div>
			);
	}
}

export default Main;