import * as d3 from 'd3';
import { html } from 'htl';
import './styles.css';
import { FruitBars, CircleSlider, StocksGraph, Arc, NbaBarChart, NbaBarChartRace } from './components';
import { fruitsData } from './data';

const bars = FruitBars(fruitsData);
const slider = CircleSlider();
// const stocks = await StocksGraph();
const arc = Arc(fruitsData);

// const nba = await NbaBarChart();

const chartGenerator = NbaBarChartRace();

async function renderChart() {
	const chartContainer = document.createElement('div');
	chartContainer.setAttribute('id', 'bar-chart-container');
	chartContainer.style.width = '100%';
	chartContainer.style.height = '900px';
	document.body.appendChild(chartContainer);
	for await (const chartNode of chartGenerator) {
		// Clear the previous chart
		while (chartContainer.firstChild) {
			chartContainer.firstChild.remove();
		}

		// Append the new chart node to the container
		chartContainer.appendChild(chartNode);
	}
}
renderChart();

// document.body.appendChild(chartGenerator.next().value);

// document.body.appendChild(nba);
// document.body.appendChild(stocks);
document.body.appendChild(bars);
document.body.appendChild(arc);
document.body.appendChild(slider);
