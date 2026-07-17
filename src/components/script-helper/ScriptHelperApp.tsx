// Ilha React do ScriptHelper: script final + copiar por padrão; a engrenagem
// abre o modal de personalização (campos, modos, criptografia age, opções e
// edição avançada do corpo). Tudo roda no navegador — nenhum valor sai da página.

import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import settingsIcon from '@iconify-icons/lucide/settings';
import copyIcon from '@iconify-icons/lucide/copy';
import checkIcon from '@iconify-icons/lucide/check';
import { composeScript } from './compose';
import type { FieldMode, FieldState, ScriptField, TargetShell } from './types';
import { cn } from './ui/cn';
import { encryptValue, isLikelyAgeRecipient } from './encryption';
import { Button } from './ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from './ui/dialog';
import { Checkbox, Input, Label, NativeSelect, Textarea } from './ui/fields';
import type { ShellEditor } from './monaco-setup';
import './styles.css';

const IDENTITY_PATH_DEFAULT = '~/.config/age/keys.txt';

const MESSAGES = {
	inlinePassword:
		'Atenção: o valor ficará em texto claro no script gerado. Considere o modo criptografado ou desativar o histórico do bash.',
	encrypted: 'Requer o CLI age e a chave privada correspondente na máquina que executará o script.',
	invalidRecipient: 'Chave pública age inválida (use o valor age1… gerado por age-keygen).',
	missingRecipient: 'Informe a chave pública age (age1…) para criptografar os campos marcados.',
};

const MODE_LABELS: Record<FieldMode, string> = {
	read: 'Perguntar ao executar (read)',
	inline: 'Embutir no script',
	encrypted: 'Criptografar (age)',
};

export interface ScriptHelperAppProps {
	script: string;
	fields: ScriptField[];
	title?: string;
	heredoc: boolean;
	historyToggle: boolean;
	encryption: boolean;
	strict: boolean;
	initialOutput: string;
}

function MonacoPane({
	value,
	readOnly,
	onChange,
}: {
	value: string;
	readOnly?: boolean;
	onChange?: (next: string) => void;
}) {
	const hostRef = useRef<HTMLDivElement>(null);
	const editorRef = useRef<ShellEditor | null>(null);
	const [ready, setReady] = useState(false);
	const onChangeRef = useRef(onChange);
	onChangeRef.current = onChange;

	useEffect(() => {
		let disposed = false;
		void (async () => {
			const { createShellEditor } = await import('./monaco-setup');
			const host = hostRef.current;
			if (disposed || !host) return;
			const editor = createShellEditor(host, { value, readOnly });
			editor.onDidChangeModelContent(() => onChangeRef.current?.(editor.getValue()));
			editorRef.current = editor;
			setReady(true);
		})();
		return () => {
			disposed = true;
			editorRef.current?.dispose();
			editorRef.current = null;
		};
		// O editor é criado uma única vez; `value` inicial vem do primeiro render.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		const editor = editorRef.current;
		if (ready && readOnly && editor && value !== editor.getValue()) {
			editor.setValue(value);
		}
	}, [value, ready, readOnly]);

	return (
		<div className="overflow-hidden rounded-md border border-border">
			<div ref={hostRef} className="min-h-24">
				{!ready && (
					<pre className="m-0 overflow-x-auto whitespace-pre-wrap break-words p-3 font-mono text-[13px] leading-relaxed">
						{value}
					</pre>
				)}
			</div>
		</div>
	);
}

export default function ScriptHelperApp(props: ScriptHelperAppProps) {
	const [body, setBody] = useState(props.script);
	const [values, setValues] = useState<Record<string, string>>(() =>
		Object.fromEntries(props.fields.map((f) => [f.var, f.defaultValue ?? ''])),
	);
	const [modes, setModes] = useState<Record<string, FieldMode>>(() =>
		Object.fromEntries(props.fields.map((f) => [f.var, f.defaultMode ?? 'read'])),
	);
	const [shell, setShell] = useState<TargetShell>('bash');
	const [heredoc, setHeredoc] = useState(props.heredoc);
	const [historyOff, setHistoryOff] = useState(false);
	const [recipient, setRecipient] = useState('');
	const [identityPath, setIdentityPath] = useState(IDENTITY_PATH_DEFAULT);
	const [output, setOutput] = useState(props.initialOutput);
	const [recipientError, setRecipientError] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);

	const outputRef = useRef(output);
	outputRef.current = output;

	const tokenRef = useRef(0);
	useEffect(() => {
		const token = ++tokenRef.current;
		const timer = window.setTimeout(async () => {
			let error: string | null = null;
			const states: FieldState[] = [];
			for (const field of props.fields) {
				const mode = modes[field.var] ?? 'read';
				const value = values[field.var] ?? '';
				let ciphertext: string | null = null;
				if (mode === 'encrypted' && value) {
					const trimmed = recipient.trim();
					if (!trimmed) {
						error = MESSAGES.missingRecipient;
					} else if (!isLikelyAgeRecipient(trimmed)) {
						error = MESSAGES.invalidRecipient;
					} else {
						try {
							ciphertext = await encryptValue(value, trimmed);
						} catch {
							error = MESSAGES.invalidRecipient;
						}
					}
				}
				states.push({ field, mode, value, ciphertext });
			}
			if (token !== tokenRef.current) return;
			setRecipientError(error);
			setOutput(
				composeScript(body, states, {
					shell,
					heredoc,
					historyOff,
					strict: props.strict,
					identityPath,
				}),
			);
		}, 150);
		return () => window.clearTimeout(timer);
	}, [
		body,
		values,
		modes,
		shell,
		heredoc,
		historyOff,
		recipient,
		identityPath,
		props.fields,
		props.strict,
	]);

	const copyButtonRef = useRef<HTMLButtonElement>(null);
	useEffect(() => {
		const button = copyButtonRef.current;
		if (!button) return;
		let clip: { destroy: () => void } | null = null;
		let timer: number | undefined;
		let disposed = false;
		void (async () => {
			const { default: ClipboardJS } = await import('clipboard');
			if (disposed) return;
			const instance = new ClipboardJS(button, { text: () => outputRef.current });
			instance.on('success', () => {
				setCopied(true);
				window.clearTimeout(timer);
				timer = window.setTimeout(() => setCopied(false), 2000);
			});
			clip = instance;
		})();
		return () => {
			disposed = true;
			clip?.destroy();
			window.clearTimeout(timer);
		};
	}, []);

	const anyEncrypted = props.fields.some((f) => (modes[f.var] ?? 'read') === 'encrypted');

	return (
		<div className="grid gap-3">
			<div className="flex flex-wrap items-center gap-2">
				<p className="m-0 grow text-sm font-semibold text-muted-foreground">
					{props.title ?? 'Script final (copie este)'}
				</p>
				<div
					role="tablist"
					aria-label="Shell do terminal onde o comando será colado"
					className="flex items-center gap-0.5 rounded-md border border-border p-0.5"
				>
					{(['bash', 'zsh', 'fish'] as const).map((s) => (
						<button
							key={s}
							type="button"
							role="tab"
							aria-selected={shell === s}
							onClick={() => setShell(s)}
							className={cn(
								'h-7 cursor-pointer rounded px-2.5 font-mono text-xs font-medium transition-colors',
								shell === s
									? 'bg-accent text-accent-foreground'
									: 'text-muted-foreground hover:text-foreground',
							)}
						>
							{s}
						</button>
					))}
				</div>
				<Dialog>
					<DialogTrigger asChild>
						<Button variant="outline" size="sm">
							<Icon icon={settingsIcon} className="size-4" aria-hidden />
							Personalizar
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Personalizar script</DialogTitle>
							<DialogDescription>
								Os valores preenchidos ficam só no seu navegador — nada é enviado para fora desta
								página.
							</DialogDescription>
						</DialogHeader>

						{props.fields.length > 0 && (
							<div className="grid gap-4">
								{props.fields.map((field) => {
									const mode = modes[field.var] ?? 'read';
									const warning =
										mode === 'inline' && field.type === 'password'
											? MESSAGES.inlinePassword
											: mode === 'encrypted'
												? MESSAGES.encrypted
												: null;
									return (
										<div key={field.var} className="grid gap-1.5">
											<Label htmlFor={`sh-input-${field.var}`}>
												{field.label}{' '}
												<code className="text-xs text-muted-foreground">${field.var}</code>
											</Label>
											<div className="flex flex-wrap gap-2">
												<Input
													id={`sh-input-${field.var}`}
													type={field.type === 'password' ? 'password' : 'text'}
													className="min-w-40 flex-1"
													placeholder={field.placeholder ?? ''}
													value={values[field.var] ?? ''}
													disabled={mode === 'read'}
													onChange={(e) =>
														setValues((prev) => ({ ...prev, [field.var]: e.target.value }))
													}
												/>
												<NativeSelect
													aria-label={`Modo do campo ${field.label}`}
													value={mode}
													onChange={(e) =>
														setModes((prev) => ({
															...prev,
															[field.var]: e.target.value as FieldMode,
														}))
													}
												>
													<option value="read">{MODE_LABELS.read}</option>
													<option value="inline">{MODE_LABELS.inline}</option>
													{props.encryption && (
														<option value="encrypted">{MODE_LABELS.encrypted}</option>
													)}
												</NativeSelect>
											</div>
											{warning && <p className="m-0 text-xs text-warning">{warning}</p>}
										</div>
									);
								})}
							</div>
						)}

						{props.encryption && anyEncrypted && (
							<div className="grid gap-3 rounded-md border border-dashed border-border p-3">
								<div className="grid gap-1.5">
									<Label htmlFor="sh-recipient">Chave pública age (recipient)</Label>
									<Textarea
										id="sh-recipient"
										rows={2}
										placeholder="age1..."
										value={recipient}
										onChange={(e) => setRecipient(e.target.value)}
									/>
								</div>
								<div className="grid gap-1.5">
									<Label htmlFor="sh-identity">Caminho da chave privada na máquina executora</Label>
									<Input
										id="sh-identity"
										value={identityPath}
										onChange={(e) => setIdentityPath(e.target.value)}
									/>
								</div>
								<p className="m-0 text-xs text-muted-foreground">
									Gere um par de chaves com <code>age-keygen -o ~/.config/age/keys.txt</code> e cole
									aqui a chave pública (<code>age1…</code>). A criptografia acontece no seu
									navegador; para decodificar, a máquina que executa o script precisa do CLI{' '}
									<code>age</code> e da chave privada correspondente.
								</p>
								{recipientError && <p className="m-0 text-xs text-destructive">{recipientError}</p>}
							</div>
						)}

						<div className="grid gap-1.5">
							<div className="flex flex-wrap gap-x-6 gap-y-2">
								<Label
									className={cn(
										'flex items-center gap-2 font-normal',
										shell === 'fish' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
									)}
								>
									<Checkbox
										checked={shell === 'fish' ? true : heredoc}
										disabled={shell === 'fish'}
										onChange={(e) => setHeredoc(e.target.checked)}
									/>
									Envolver em <code>bash &lt;&lt;'EOF'</code>
								</Label>
								{props.historyToggle && (
									<Label
										className={cn(
											'flex items-center gap-2 font-normal',
											shell !== 'bash' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
										)}
									>
										<Checkbox
											checked={shell === 'bash' && historyOff}
											disabled={shell !== 'bash'}
											onChange={(e) => setHistoryOff(e.target.checked)}
										/>
										Desativar histórico do bash
									</Label>
								)}
							</div>
							{shell === 'fish' && (
								<p className="m-0 text-xs text-muted-foreground">
									No fish não há heredoc: o script é sempre encapsulado com{' '}
									<code>printf … | bash</code>. Desativar o histórico só está disponível no bash.
								</p>
							)}
						</div>

						<details className="rounded-md border border-border p-3">
							<summary className="cursor-pointer text-sm font-medium text-muted-foreground">
								Editar corpo do script (avançado)
							</summary>
							<div className="mt-3">
								<MonacoPane value={body} onChange={setBody} />
							</div>
						</details>

						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline">Concluído</Button>
							</DialogClose>
						</DialogFooter>
					</DialogContent>
				</Dialog>
				<Button size="sm" ref={copyButtonRef}>
					<Icon icon={copied ? checkIcon : copyIcon} className="size-4" aria-hidden />
					{copied ? 'Copiado!' : 'Copiar script'}
				</Button>
				<span className="sr-only" aria-live="polite">
					{copied ? 'Script copiado' : ''}
				</span>
			</div>

			<MonacoPane value={output} readOnly />

			<p className="m-0 text-xs text-muted-foreground">
				Os valores preenchidos ficam só no seu navegador — nada é enviado para fora desta página.
				Leia o script gerado por completo antes de executá-lo.
			</p>
		</div>
	);
}
