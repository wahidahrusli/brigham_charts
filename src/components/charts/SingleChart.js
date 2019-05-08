import React, {Component} from 'react';
import {select, event, selectAll} from "d3-selection";
import {zoom, zoomIdentity} from "d3-zoom";
import {scaleLinear, scaleOrdinal, scaleIdentity, scaleTime} from "d3-scale";
import {axisBottom, axisLeft, axisRight} from "d3-axis";
import { max, min, extent } from 'd3-array';
import {timeFormat} from 'd3-time-format';
import {line, curveLinear} from 'd3-shape';
import {brushX} from 'd3-brush';
import PropTypes from "prop-types";

import {timeSecond, timeMinute, timeHour, timeDay, timeMonth, timeWeek, timeYear} from 'd3-time';
import './style.css';


class SingleChart extends Component{

	constructor(props){
		super(props)
		this.state={
			object: null
		}

	}

	componentDidMount() {


       	let timeFrame = this.primaryTimeFrameParse(this.props.dataset);

       	let start_date = timeFrame.start_date;
       	let finish_date = timeFrame.finish_date;
       	let measure_values = timeFrame.measure_values;
       	
       	let formatMillisecond = timeFormat(".%L"),
		    formatSecond = timeFormat(":%S"),
		    formatMinute = timeFormat("%I:%M"),
		    formatHour = timeFormat("%I %p"),
		    formatDay = timeFormat("%a %d"),
		    formatWeek = timeFormat("%b %d"),
		    formatMonth = timeFormat("%B"),
		    formatYear = timeFormat("%y");

		function multiFormat(date) {
		  return (timeSecond(date) < date ? formatMillisecond
		    : timeMinute(date) < date ? formatSecond
		    : timeHour(date) < date ? formatMinute
		    : timeDay(date) < date ? formatHour
		    : timeMonth(date) < date ? (timeWeek(date) < date ? formatDay : formatWeek)
		    : timeYear(date) < date ? formatMonth
		    : formatYear)(date);
		}
       	
	
		let svgWidth = 600;
		let svgHeight = 100;

		let margin = {top: 30, right: 1, bottom: 50, left: 5};
		let width = +svgWidth - margin.left - margin.right;
		let height = +svgHeight - margin.top - margin.bottom;

		let {domain_names, ranges, yDomainMap, new_height} = this.yDomainNames(this.props.dataset);
		height = new_height;
		svgHeight = height+margin.top+margin.bottom;

       	let yNames = domain_names;
       	let yRange = ranges;

       	let zooming = zoom()
					.scaleExtent([1, 32])
					.translateExtent([[0, 0], [width, height]])
    				.extent([[0, 0], [width, height]])
    				.on("zoom", zoomFunction);

        let svgViewport = select("body")
							  .append('svg')
							  .attr('width', svgWidth)
							  .attr('height', svgHeight)
							  .attr('left', '10px')
							  .call(zooming);
		let xAxisScale =scaleTime()
  						.domain([start_date, finish_date])
  						.range([0,width]);

  		let xAxisScale2 =scaleTime()
  						.domain([start_date, finish_date])
  						.range([0,width]);

  		
  		let yAxisScale = scaleOrdinal()
  						.domain(yNames)
 						.range(yRange);
 		let xAxis = axisBottom(xAxisScale);
		let yAxis = axisLeft(yAxisScale);

		

    	let innerSpace = svgViewport.append("g")
					    .attr("class", "inner_space")
					    .attr("transform", "translate(" + (margin.left) + "," + margin.top + ")")
					    .call(zooming);

		let div = select("body").append("div")	
				    .attr("class", "tooltip")				
				    .style("opacity", 0);

		let root_rects = innerSpace.selectAll("rect")
						.data(measure_values);	
		
		let rects =	root_rects.enter()
						.append('rect')
						.attr('id', 'rect')
						.attr('x', (data)=>{return xAxisScale(data.measure_date)-3;})
						.attr('y', (data)=>{
						 	return yAxisScale(data.measure)-18;
						})
						

		let rectsLeft = root_rects.enter()
						.append('rect')
						.attr('id', 'rectLeft')
						.attr('x', (data)=>{
							return xAxisScale(data.measure_date_minus)-2;
						})
						.attr('y', (data)=>{
						 	return yAxisScale(data.measure)-8;
						});
						

		let rectsRight = root_rects.enter()
						.append('rect')
						.attr('id', 'rectRight')
						.attr('x', (data)=>{
							return xAxisScale(data.measure_date_plus)-2;
						})
						.attr('y', (data)=>{
						 	return yAxisScale(data.measure)-8;
						});

		let lineDataset = this.lineFuncData(timeFrame.measure_values);
		

		let paths = {};

		let lineF = line()
			    .x((data, i) =>{ return xAxisScale(data.x); }) // set the x values for the line generator
			    .y((data) => { return yAxisScale(data.y); }) // set the y values for the line generator 

		for (let line_index in lineDataset){
			let line_data = lineDataset[line_index];

			let path =innerSpace.append("path")
			    .datum(line_data) 
			    .attr("class", "line") 
			    .attr("clip-path", "url(#clip)")
			    .attr("d", lineF);

			paths[line_index] = path;
		}


		

		let gX = innerSpace.append("g")
				    .attr("class", "axis axis--x")
				    .attr("transform", "translate(0," + height + ")")
				    .call(xAxis.tickFormat(multiFormat));


		function zoomFunction(){
			  let new_xScale = event.transform.rescaleX(xAxisScale)
			  gX.call(xAxis.scale(new_xScale));

			  rects.attr("x", function(data) { 
			  	return new_xScale(data.measure_date)-2; 
			  });
			  rectsLeft.attr("x", function(data) { 
			  	return new_xScale(data.measure_date_minus)-2; 
			  });

			  rectsRight.attr("x", function(data) { 
			  	return new_xScale(data.measure_date_plus)-2; 
			  });
			

			  let paths_indices = Object.keys(paths);
			  paths_indices.forEach((index)=>{
			  		let path = paths[index];
			  		path.attr("d", lineF.x((d)=>{
			  			return new_xScale(d.x);
			  		}))
			  });
		};
		
	}


	yDomainNames(dataset){

		let domain_names = Object.keys(dataset);
		domain_names = domain_names.filter((data)=> data !== 'primary-time-frame');
		
		let ranges = [];
		let yDomainMap = {};
		domain_names = domain_names.reverse();
		domain_names.forEach((data)=>{
			let range = ranges.length>0?ranges[ranges.length-1]+30:30;
			ranges.push(range);
			yDomainMap[data] = range;
		});
		domain_names = domain_names.reverse();
		ranges = ranges.reverse();

		domain_names = ['', ...domain_names];
		yDomainMap[""] = ranges[0]+30;
		ranges.unshift(ranges[0]+30);

		let new_height = ranges[0];

		return {domain_names, ranges, yDomainMap, new_height};
	}

	lineFuncData(measure_values){

		let result = [];
		for (let measure of measure_values) {

			let measure_res = [
				{x:measure.measure_date_minus, y:measure.measure},
				{x:measure.measure_date, y:measure.measure},
				{x:measure.measure_date_plus, y:measure.measure},
			];
			result.push(measure_res);
		}

		return result;
	}

	generateArrayNumbers(min, max){
		let result = [];
		for (let i = min; i<=max; i++){
			result.push(i);
		}
		return result;
	}

	primaryTimeFrameParse(dataset){
		let primaryTimeFrame = dataset['primary-time-frame'];
		let age = primaryTimeFrame.value;
		let age_plus = primaryTimeFrame.plus;
		let age_minus = primaryTimeFrame.minus;

		let date_now = new Date(Date.now());
		let start_year = date_now.getFullYear() - age;
		let start_date = new Date(`01/01/${1}`);
		let finish_date = new Date(`01/01/${1+age+age_plus}`);

		const dayInterval = 1000 * 60 * 60 * 24;

		let range_dates = this.getDates(start_date, finish_date, dayInterval)

		let measures = Object.keys(dataset).filter(data=>data!=='primary-time-frame');

		let measure_values = [];
		for (let measure of measures){
			let measure_object = dataset[measure]
			let rescaleMeasuresResult = this.rescaleMeasures(measure_object, age);
			let measure_date = rescaleMeasuresResult[0];
			let measure_date_minus = rescaleMeasuresResult[1];
			let measure_date_plus = rescaleMeasuresResult[2];
			
			let measure_relatives = [];
			let toolTipAxis = Array.apply(0, Array(age+age_plus)).map(function(i, j) { return j+1; })

			if (measure_object.relative_measures){
				for (let relative_measure of measure_object.relative_measures){
					
					let value = parseInt(relative_measure.value);
					let relative_mesure_name = relative_measure.measure;
					let relative_mesure_unit = relative_measure.unit;
					
					let value_plus = parseInt(relative_measure.plus);
					let value_minus = parseInt(relative_measure.minus);
					let minus_array = this.generateArrayNumbers((value - value_minus), value-1);
					
					let plus_array = this.generateArrayNumbers(value+1, (value+value_plus));

					minus_array = this.fitMinusArrayNumbers(minus_array);
					plus_array = this.fitPlusArrayNumbers(plus_array);

					let xNumbers = [...minus_array, value, ...plus_array];
			
					measure_relatives.push({relative_mesure_name, 
						relative_measure_minus:value_minus,
						relative_measure_plus:value_plus, 
						toolTipAxis:xNumbers, relative_mesure_unit, 
						relative_measure_value:value});

				}
			}
			
			measure_values.push({measure, measure_date, measure_date_minus, measure_date_plus, measure_relatives, toolTipAxis});
		}



		return {
			'start_date':start_date,
			'finish_date':finish_date,
			'measure_values':measure_values,
		};

	}

	fitMinusArrayNumbers(array){
		if (array.length > 8){
			let result = [array[0], "..."];
			let s = array.length - 6;
			let second_part = array.slice(s);
			result = [...result, ...second_part];
			return result;
			
		}
		return array;
	}

	fitPlusArrayNumbers(array){
		if (array.length > 8){
			let result = [array.slice(0, 7), "...", array[array.length-1]];
			return result;
			
		}
		return array;
	}

	rescaleMeasures(measure_object, age){
		let unit = measure_object.unit;
		let value = measure_object.value;
		let minus = measure_object.minus;
		let plus = measure_object.plus;

		if (value === 0 || unit !== 'years'){
			value = age;
		}
		let measure_date = null;
		let measure_date_minus = null;
		let measure_date_plus = null;
		if (unit === 'years'){
			measure_date = new Date(`01/01/${value}`);
			measure_date_minus = new Date(`01/01/${value}`);
			measure_date_plus = new Date(`01/01/${value}`);

			let year = measure_date_minus.getFullYear() - minus;
			measure_date_minus = new Date(measure_date_minus.setYear(year));

			let plus_year = measure_date_plus.getFullYear() + plus;
			measure_date_plus = new Date(measure_date_plus.setYear(plus_year));
		}
		else if (unit === 'months'){
			measure_date = new Date(`01/01/${value}`);
			measure_date_minus = new Date(`01/01/${value}`);
			measure_date_plus = new Date(`01/01/${value}`);

			let minus_month = measure_date.getMonth() - minus;
			measure_date_minus = new Date(measure_date_minus.setMonth(minus_month));

			let plus_month = measure_date.getMonth() + plus;
			measure_date_plus = new Date(measure_date_plus.setMonth(plus_month));

		}

		return [measure_date, measure_date_minus, measure_date_plus];
	}


	getDates(startDate, endDate, interval){
		const duration = endDate - startDate;
		const steps = duration / interval;
		return Array.from({length: steps+1}, (v,i) => new Date(startDate.valueOf() + (interval * i)));
	}

	render(){
		return('');
	}

}

export default SingleChart;

SingleChart.propTypes = {
	dataset: PropTypes.array,
	value: PropTypes.number.isRequired,
	unit: PropTypes.string.isRequired,
	plus: PropTypes.number.isRequired,
	minus: PropTypes.number.isRequired
}