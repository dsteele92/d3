import * as d3 from 'd3';
import { html } from 'htl';
import './styles.css';
import { FruitBars, CircleSlider, StocksGraph } from './components';
import { fruitsData } from './data';

const bars = FruitBars(fruitsData);
const slider = CircleSlider();
const stocks = await StocksGraph();

document.body.appendChild(bars);
document.body.appendChild(slider);
document.body.appendChild(stocks);
