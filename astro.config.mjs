// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';
import react from '@astrojs/react';
import { rehypeLinkBadges } from './src/plugins/rehype-link-badges.mjs';

const SITE = 'https://guesant.github.io';
const BASE = '/infrastructure-and-cluster-notebook';

export default defineConfig({
	site: SITE,
	base: BASE,
	markdown: {
		rehypePlugins: [[rehypeLinkBadges, { siteOrigins: [`${SITE}${BASE}`] }]],
	},
	integrations: [
		mermaid({
			theme: 'neutral',
			autoTheme: true,
		}),
		starlight({
			title: 'infrastructure-and-cluster-notebook',
			lastUpdated: true,
			customCss: ['./src/styles/links.css'],
			description:
				'Anotações práticas sobre infraestrutura, containers e clusters: conceitos, blueprints, guias, operação, ferramentas e scripts — com foco atual em K3s de nó único ou multinó.',
			locales: {
				root: { label: 'Português', lang: 'pt-BR' },
			},
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/guesant/infrastructure-and-cluster-notebook',
				},
			],
			editLink: {
				baseUrl: 'https://github.com/guesant/infrastructure-and-cluster-notebook/edit/main/',
			},
			components: {
				Footer: './src/components/overrides/Footer.astro',
			},
			sidebar: [
				{
					label: 'Primeiros passos',
					items: [{ autogenerate: { directory: 'getting-started' } }],
				},
				{
					label: 'Aprender',
					items: [
						{ label: 'Clusters', items: [{ autogenerate: { directory: 'learn/clusters' } }] },
						{ label: 'Containers', items: [{ autogenerate: { directory: 'learn/containers' } }] },
						{
							label: 'Virtualização',
							items: [{ autogenerate: { directory: 'learn/virtualization' } }],
						},
						{
							label: 'Rede',
							items: [{ autogenerate: { directory: 'learn/networking' } }],
						},
						{
							label: 'Armazenamento',
							items: [{ autogenerate: { directory: 'learn/storage' } }],
						},
						{
							label: 'Segredos',
							items: [{ autogenerate: { directory: 'learn/secrets-management' } }],
						},
						{
							label: 'Observabilidade',
							items: [{ autogenerate: { directory: 'learn/observability' } }],
						},
						{
							label: 'Backups',
							items: [{ autogenerate: { directory: 'learn/backups' } }],
						},
						{
							label: 'Unix',
							items: [{ autogenerate: { directory: 'learn/unix' } }],
						},
					],
				},
				{
					label: 'Guias',
					items: [
						{
							label: 'Blueprints',
							items: [{ autogenerate: { directory: 'guides/blueprints' } }],
						},
						{
							label: 'Host',
							items: [{ autogenerate: { directory: 'guides/tasks/host' } }],
						},
						{
							label: 'Kubernetes',
							items: [{ autogenerate: { directory: 'guides/tasks/kubernetes' } }],
						},
						{
							label: 'Rede',
							items: [{ autogenerate: { directory: 'guides/tasks/networking' } }],
						},
						{
							label: 'Certificados',
							items: [{ autogenerate: { directory: 'guides/tasks/certificates' } }],
						},
						{
							label: 'Armazenamento',
							items: [{ autogenerate: { directory: 'guides/tasks/storage' } }],
						},
						{
							label: 'Bancos de dados',
							items: [{ autogenerate: { directory: 'guides/tasks/databases' } }],
						},
						{
							label: 'GitOps',
							items: [{ autogenerate: { directory: 'guides/tasks/gitops' } }],
						},
						{
							label: 'Observabilidade',
							items: [{ autogenerate: { directory: 'guides/tasks/observability' } }],
						},
						{
							label: 'Secrets',
							items: [{ autogenerate: { directory: 'guides/tasks/secrets' } }],
						},
					],
				},
				{
					label: 'Operação',
					items: [
						{ label: 'Checklists', items: [{ autogenerate: { directory: 'operations/checklists' } }] },
						{ label: 'Manutenção', items: [{ autogenerate: { directory: 'operations/maintenance' } }] },
						{ label: 'Atualizações', items: [{ autogenerate: { directory: 'operations/upgrades' } }] },
						{ label: 'Backups', items: [{ autogenerate: { directory: 'operations/backups' } }] },
						{
							label: 'Disaster recovery',
							items: [{ autogenerate: { directory: 'operations/disaster-recovery' } }],
						},
						{
							label: 'Troubleshooting',
							items: [{ autogenerate: { directory: 'operations/troubleshooting' } }],
						},
						{
							label: 'Observabilidade',
							items: [{ autogenerate: { directory: 'operations/observability' } }],
						},
					],
				},
				{
					label: 'Toolbox',
					items: [{ autogenerate: { directory: 'toolbox/tools' } }],
				},
				{
					label: 'Tecnologias',
					items: [{ autogenerate: { directory: 'technologies' } }],
				},
				{
					label: 'Recursos',
					items: [{ autogenerate: { directory: 'resources' } }],
				},
				{
					label: 'Referência',
					items: [{ autogenerate: { directory: 'reference' } }],
				},
				{
					label: 'Projeto',
					items: [{ autogenerate: { directory: 'project' } }],
				},
				{
					label: 'Contribuição',
					items: [{ autogenerate: { directory: 'contributing' } }],
				},
			],
		}),
		react(),
	],
});
