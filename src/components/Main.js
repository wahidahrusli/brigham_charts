import React, {Component} from 'react';
import SingleChart from './charts/SingleChart';
import GanttChart from './charts/GanttChart';
import {select, event, selectAll} from "d3-selection";
import {zoom, zoomIdentity} from "d3-zoom";
import {scaleLinear, scaleOrdinal} from "d3-scale";
import {axisBottom, axisLeft} from "d3-axis";
import {timeFormat} from 'd3-time-format';

class Main extends Component{

	render(){

		let dataset1 = {
			'primary-time-frame':{value:10, unit:'years', plus:1, minus:1},
			BLCVA:{
				value:0, unit:'months', plus:4, minus:4,
				relative_measures:[
					{'measure':'First Attack Date1', value:'20', unit:'days', 'plus':1, minus:1},
					{'measure':'First Attack Date2', value:'10', unit:'months', 'plus':4, minus:4},
					{'measure':'First Attack Date3', value:'5', unit:'months', 'plus':6, minus:6},
					{'measure':'First Attack Date4', value:'3', unit:'years', 'plus':2, minus:2},
				]
			},
			EDSS:{value:9, unit:'years', plus:1, minus:1},
			EDSS2:{value:5, unit:'months', plus:2, minus:2},
			EDSS3:{value:7, unit:'years', plus:3, minus:3}
		};

		let dataset2 = {
			'primary-time-frame':{value:10, unit:'years', plus:1, minus:1},
			EDSS:{value:9, unit:'years', plus:1, minus:1},
			
		};

		return(
			<div>
				{/*<div class="bar-chart"/>*/}
				<GanttChart dataset={dataset1}/>
                <br/>
                <SingleChart dataset={dataset2}/>
                
			</div>
			);
	}
}

export default Main;