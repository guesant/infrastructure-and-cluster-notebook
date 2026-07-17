// Setup do Monaco Editor (apenas navegador; importar via import() dinâmico).
// O tema segue o claro/escuro do Starlight: o Monaco não aceita variáveis CSS,
// então resolvemos as cores da paleta em runtime e observamos [data-theme].

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-editor/esm/vs/basic-languages/shell/shell.contribution';
// @ts-expect-error — import de worker resolvido pelo Vite
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

export type ShellEditor = monaco.editor.IStandaloneCodeEditor;

const THEME_NAME = 'script-helper';
let ready = false;

function resolveColor(cssVar: string, fallback: string): string {
	const probe = document.createElement('span');
	probe.style.cssText = `position:absolute;visibility:hidden;color:var(${cssVar})`;
	document.body.append(probe);
	const rgb = getComputedStyle(probe).color.match(/\d+/g);
	probe.remove();
	if (!rgb || rgb.length < 3) return fallback;
	return `#${rgb
		.slice(0, 3)
		.map((n) => Number(n).toString(16).padStart(2, '0'))
		.join('')}`;
}

function applyTheme() {
	const dark = document.documentElement.dataset.theme !== 'light';
	monaco.editor.defineTheme(THEME_NAME, {
		base: dark ? 'vs-dark' : 'vs',
		inherit: true,
		rules: [],
		colors: {
			'editor.background': resolveColor('--sl-color-black', dark ? '#17181c' : '#ffffff'),
			'editor.foreground': resolveColor('--sl-color-white', dark ? '#ffffff' : '#17181c'),
		},
	});
	monaco.editor.setTheme(THEME_NAME);
}

function ensureSetup() {
	if (ready) return;
	ready = true;
	(self as { MonacoEnvironment?: unknown }).MonacoEnvironment = {
		getWorker: () => new EditorWorker(),
	};
	applyTheme();
	new MutationObserver(applyTheme).observe(document.documentElement, {
		attributes: true,
		attributeFilter: ['data-theme'],
	});
}

const baseEditorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
	language: 'shell',
	theme: THEME_NAME,
	minimap: { enabled: false },
	wordWrap: 'on',
	// 'advanced' mede a largura real de cada caractere; o padrão ('simple')
	// assume largura fixa e erra a coluna de quebra nesta fonte, deixando
	// linhas mais longas que o host e exigindo scroll horizontal.
	wrappingStrategy: 'advanced',
	scrollBeyondLastLine: false,
	automaticLayout: true,
	folding: false,
	fontSize: 13,
	lineNumbersMinChars: 3,
	padding: { top: 8, bottom: 8 },
	scrollbar: { alwaysConsumeMouseWheel: false },
	overviewRulerLanes: 0,
	contextmenu: false,
};

/** Ajusta a altura do host ao conteúdo, limitada a `maxPx`. */
function autoGrow(editor: ShellEditor, host: HTMLElement, maxPx = 460) {
	const apply = () => {
		const height = Math.min(Math.max(editor.getContentHeight(), 96), maxPx);
		host.style.height = `${height}px`;
		editor.layout();
	};
	editor.onDidContentSizeChange(apply);
	apply();
}

export function createShellEditor(
	host: HTMLElement,
	opts: { value: string; readOnly?: boolean },
): ShellEditor {
	ensureSetup();
	const editor = monaco.editor.create(host, {
		...baseEditorOptions,
		value: opts.value,
		...(opts.readOnly
			? { readOnly: true, domReadOnly: true, renderLineHighlight: 'none' as const }
			: {}),
	});
	autoGrow(editor, host);
	// Na primeira criação o host pode ainda não ter a largura final (ex.: dentro
	// do <dialog>, que só aplica seu próprio layout depois deste tick). Sem isso
	// o wrap fica calculado para uma largura errada e nunca é refeito sozinho.
	requestAnimationFrame(() => editor.layout());
	return editor;
}
