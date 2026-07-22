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
						{
							label: 'Unix',
							collapsed: true,
							items: [{ autogenerate: { directory: 'learn/unix' } }],
						},
						{
							label: 'Virtualização',
							collapsed: true,
							items: [{ autogenerate: { directory: 'learn/virtualization' } }],
						},
						{
							label: 'Containers',
							collapsed: true,
							items: [{ autogenerate: { directory: 'learn/containers' } }],
						},
						{
							label: 'Rede',
							collapsed: true,
							items: [{ autogenerate: { directory: 'learn/networking' } }],
						},
						{
							label: 'Clusters',
							collapsed: true,
							items: [{ autogenerate: { directory: 'learn/clusters' } }],
						},
						{
							label: 'Armazenamento',
							collapsed: true,
							items: [{ autogenerate: { directory: 'learn/storage' } }],
						},
						{
							label: 'Backups',
							collapsed: true,
							items: [{ autogenerate: { directory: 'learn/backups' } }],
						},
						{
							label: 'Segredos',
							collapsed: true,
							items: [{ autogenerate: { directory: 'learn/secrets-management' } }],
						},
						{
							label: 'Segurança',
							collapsed: true,
							items: [{ autogenerate: { directory: 'learn/security' } }],
						},
						{
							label: 'Observabilidade',
							collapsed: true,
							items: [{ autogenerate: { directory: 'learn/observability' } }],
						},
						{
							label: 'Automação',
							collapsed: true,
							items: [{ autogenerate: { directory: 'learn/automation' } }],
						},
					],
				},
				{
					label: 'Guias',
					items: [
						{
							label: 'Blueprints',
							collapsed: true,
							items: [{ autogenerate: { directory: 'guides/blueprints' } }],
						},
						{
							label: 'Host',
							collapsed: true,
							items: [{ autogenerate: { directory: 'guides/tasks/host' } }],
						},
						{
							label: 'Kubernetes',
							collapsed: true,
							items: [{ autogenerate: { directory: 'guides/tasks/kubernetes' } }],
						},
						{
							label: 'Rede',
							collapsed: true,
							items: [{ autogenerate: { directory: 'guides/tasks/networking' } }],
						},
						{
							label: 'Certificados',
							collapsed: true,
							items: [{ autogenerate: { directory: 'guides/tasks/certificates' } }],
						},
						{
							label: 'Armazenamento',
							collapsed: true,
							items: [{ autogenerate: { directory: 'guides/tasks/storage' } }],
						},
						{
							label: 'Bancos de dados',
							collapsed: true,
							items: [{ autogenerate: { directory: 'guides/tasks/databases' } }],
						},
						{
							label: 'GitOps',
							collapsed: true,
							items: [{ autogenerate: { directory: 'guides/tasks/gitops' } }],
						},
						{
							label: 'Segredos',
							collapsed: true,
							items: [{ autogenerate: { directory: 'guides/tasks/secrets' } }],
						},
						{
							label: 'Observabilidade',
							collapsed: true,
							items: [{ autogenerate: { directory: 'guides/tasks/observability' } }],
						},
						{
							label: 'Backup',
							collapsed: true,
							items: [{ autogenerate: { directory: 'guides/tasks/backup' } }],
						},
						{
							label: 'Segurança',
							collapsed: true,
							items: [{ autogenerate: { directory: 'guides/tasks/security' } }],
						},
						{
							label: 'Automação',
							collapsed: true,
							items: [{ autogenerate: { directory: 'guides/tasks/automation' } }],
						},
					],
				},
				{
					label: 'Operação',
					items: [
						{
							label: 'Checklists',
							collapsed: true,
							items: [{ autogenerate: { directory: 'operations/checklists' } }],
						},
						{
							label: 'Observabilidade',
							collapsed: true,
							items: [{ autogenerate: { directory: 'operations/observability' } }],
						},
						{
							label: 'Manutenção',
							collapsed: true,
							items: [{ autogenerate: { directory: 'operations/maintenance' } }],
						},
						{
							label: 'Atualizações',
							collapsed: true,
							items: [{ autogenerate: { directory: 'operations/upgrades' } }],
						},
						{
							label: 'Backups',
							collapsed: true,
							items: [{ autogenerate: { directory: 'operations/backups' } }],
						},
						{
							label: 'Disaster recovery',
							collapsed: true,
							items: [{ autogenerate: { directory: 'operations/disaster-recovery' } }],
						},
						{
							label: 'Troubleshooting',
							collapsed: true,
							items: [{ autogenerate: { directory: 'operations/troubleshooting' } }],
						},
					],
				},
				{
					label: 'Toolbox',
					items: [
						{
							label: 'Ferramentas',
							collapsed: true,
							items: [{ autogenerate: { directory: 'toolbox/tools' } }],
						},
						{
							label: 'Comandos',
							collapsed: true,
							items: [{ autogenerate: { directory: 'toolbox/commands' } }],
						},
						{
							label: 'Snippets',
							collapsed: true,
							items: [{ autogenerate: { directory: 'toolbox/snippets' } }],
						},
					],
				},
				{
					label: 'Recursos',
					collapsed: true,
					items: [{ autogenerate: { directory: 'resources' } }],
				},
				{
					label: 'Projeto',
					collapsed: true,
					items: [{ autogenerate: { directory: 'project' } }],
				},
				{
					label: 'Contribuição',
					collapsed: true,
					items: [{ autogenerate: { directory: 'contributing' } }],
				},
			],
		}),
		react(),
	],
});
