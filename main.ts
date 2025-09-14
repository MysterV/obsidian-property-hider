import { Plugin, PluginSettingTab, Setting } from 'obsidian';

interface PropertyHiderSettings {
	properties: PropertyItem[];
}

interface PropertyItem {
	name: string;
	hidden: boolean;
}

const DEFAULT_SETTINGS: PropertyHiderSettings = {
	properties: []
}

export default class PropertyHiderPlugin extends Plugin {
	settings: PropertyHiderSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new PropertyHiderSettingTab(this.app, this));
		this.updateCSS();
		this.addCommands();
	}

	addCommands() {
		// Add toggle commands for each property
		this.settings.properties.forEach((prop, index) => {
			this.addCommand({
				id: `toggle-${prop.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
				name: `Toggle visibility: ${prop.name}`,
				callback: async () => {
					this.toggleProperty(index);
					await this.saveSettings();
				}
			});
		});
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.updateCSS();
		this.refreshCommands();
	}

	refreshCommands() {
        const appAny = this.app as any;

		// Remove all existing toggle commands
		appAny.commands.removeCommand = appAny.commands.removeCommand || function(id: string) {
			delete this.commands[id];
			delete this.editorCommands[id];
		};

		// Remove old commands
		Object.keys(appAny.commands.commands).forEach(id => {
			if (id.startsWith(this.manifest.id + ':toggle-')) {
				appAny.commands.removeCommand(id);
			}
		});

		// Re-add commands with current properties
		this.addCommands();
	}

	onunload() {
		this.removeCSS();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	updateCSS() {
		this.removeCSS();
		
		const hiddenProperties = this.settings.properties
			.filter(prop => prop.hidden)
			.map(prop => `.metadata-property[data-property-key="${prop.name}"]`)
			.join(',\n');

		if (hiddenProperties) {
			const css = `${hiddenProperties} { display: none !important; }`;
			const style = document.createElement('style');
			style.id = 'property-hider-style';
			style.textContent = css;
			document.head.appendChild(style);
		}
	}

	removeCSS() {
		const existing = document.getElementById('property-hider-style');
		if (existing) existing.remove();
	}

	addProperty(name: string): boolean {
		if (!name || this.settings.properties.some(p => p.name === name)) return false;
		this.settings.properties.push({ name, hidden: true });
		return true;
	}

	deleteProperty(index: number) {
		this.settings.properties.splice(index, 1);
	}

	toggleProperty(index: number) {
		this.settings.properties[index].hidden = !this.settings.properties[index].hidden;
	}

	renameProperty(index: number, newName: string): boolean {
		if (!newName || this.settings.properties.some((p, i) => p.name === newName && i !== index)) return false;
		this.settings.properties[index].name = newName;
		return true;
	}
}

class PropertyHiderSettingTab extends PluginSettingTab {
	plugin: PropertyHiderPlugin;

	constructor(app: any, plugin: PropertyHiderPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h3', { text: 'Hidden Properties' });

		// Add property input
		let inputEl: HTMLInputElement;
		new Setting(containerEl)
			.setName('Add Property')
			.setDesc('Enter property name to hide in notes and file properties view')
			.addText(text => {
				inputEl = text.inputEl;
				text.setPlaceholder('Property name');
				
				// Enter key support
				text.inputEl.addEventListener('keypress', async (e) => {
					if (e.key === 'Enter') {
						const name = text.inputEl.value.trim();
						if (this.plugin.addProperty(name)) {
							await this.plugin.saveSettings();
							text.inputEl.value = '';
							this.display();
						}
					}
				});
			})
			.addButton(button => {
				button
					.setIcon('plus')
                    .setTooltip('Add property')
					.setCta()
					.onClick(async () => {
						const name = inputEl.value.trim();
						if (this.plugin.addProperty(name)) {
							await this.plugin.saveSettings();
							inputEl.value = '';
							this.display();
						}
					});
			});

		// Property list
		if (this.plugin.settings.properties.length > 0) {
			this.plugin.settings.properties.forEach((prop, index) => {
				new Setting(containerEl)
					.addText(text => {
						text.setValue(prop.name)
							.onChange(async (value) => {
								if (value.trim() && this.plugin.renameProperty(index, value.trim())) {
									await this.plugin.saveSettings();
								}
							});
					})
					.addButton(button => {
						button
							.setIcon(prop.hidden ? 'eye-off' : 'eye')
							.setTooltip(prop.hidden ? 'Show property' : 'Hide property')
							.onClick(async () => {
								this.plugin.toggleProperty(index);
								await this.plugin.saveSettings();
								this.display();
							});
					})
					.addButton(button => {
						button
							.setIcon('trash')
							.setTooltip('Delete property')
							.setWarning()
							.onClick(async () => {
								this.plugin.deleteProperty(index);
								await this.plugin.saveSettings();
								this.display();
							});
					});
			});
		}
	}
}
