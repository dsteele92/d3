import * as d3 from 'd3';
import { html } from 'htl';
import './styles.css';
import { FruitBars, CircleSlider, StocksGraph, Arc, BarChartRace } from './components';
import { fruitsData } from './data';

const bars = FruitBars(fruitsData);
const slider = CircleSlider();
// const stocks = await StocksGraph();
const arc = Arc(fruitsData);

const nba = await BarChartRace();

document.body.appendChild(nba);
// document.body.appendChild(stocks);
document.body.appendChild(bars);
document.body.appendChild(arc);
document.body.appendChild(slider);
