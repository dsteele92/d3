import * as d3 from 'd3';
import { html } from 'htl';

// need to import x, y, and formatDate and formatClose for this to work

export class Tooltip {
	constructor() {
		this._date = html`<text y="-22"></text>`;
		this._close = html`<text y="-12"></text>`;
		this.node = html`<g
			pointer-events="none"
			display="none"
			font-family="sans-serif"
			font-size="10"
			text-anchor="middle"
		>
			<rect x="-27" width="54" y="-30" height="20" fill="white"></rect>
			${this._date} ${this._close}
			<circle r="2.5"></circle>
		</g>`;
	}
	show(d) {
		this.node.removeAttribute('display');
		this.node.setAttribute('transform', `translate(${x(d.date)},${y(d.close)})`);
		this._date.textContent = formatDate(d.date);
		this._close.textContent = formatClose(d.close);
	}
	hide() {
		this.node.setAttribute('display', 'none');
	}
}
