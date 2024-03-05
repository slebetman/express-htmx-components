const { html, css } = require('./index');

test('HTML tag should return plain html', () => {
	expect(html`<div>hello <span>world</span></div>`)
		.toBe('<div>hello <span>world</span></div>');
});

test('HTML in variables should be escaped', () => {
	const tomAndJerry = `<span>"tom" & 'jerry'</span>`;

	expect(html`<div>hello ${tomAndJerry}</div>`)
		.toBe('<div>hello &lt;span&gt;&quot;tom&quot; &amp; &#039;jerry&#039;&lt;/span&gt;</div>');
});

test('HTML in $$ blocks should not be escaped', () => {
	const jerry = `'jerry'`;
	const tomAndJerry = html`<span>"tom" & ${jerry}</span>`;

	expect(html`<div>hello $${tomAndJerry}</div>`)
		.toBe('<div>hello <span>"tom" & &#039;jerry&#039;</span></div>');
});

test('CSS should return plain css',() => {
	expect(css`html body { color: black }`)
		.toBe('html body { color: black }');
})

test('CSS in variables should return plain css',() => {
	const style = '{ color: black }'

	expect(css`html body ${style}`)
		.toBe('html body { color: black }');
})