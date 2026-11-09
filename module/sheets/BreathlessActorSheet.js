/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends foundry.appv1.sheets.ActorSheet
 */
export class BreathlessActorSheet extends foundry.appv1.sheets.ActorSheet {

    constructor(...args) {
        super(...args);
    
        let width = 950;
        let height = 710;
        if (this.actor.type == 'npc') {
            width = 310;
            height = 820;
        }
        this.position.width = width;
        this.position.height = height;
    }

    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['breathless2', 'csbg', 'sheet', 'actor', 'actor-sheet'],
            left:120,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "main" }],
            dragDrop: [{dragSelector: ".dragline", dropSelector: null}]
        });
    }

    /** @override */
    get template() {
        return `systems/breathless2/templates/actor/actor-${this.actor.type}-sheet.hbs`;
    }

    /** @override */
    getData() {
        const context = super.getData();
        const actorData = this.actor.toObject(false);

        context.system = actorData.system;
        context.flags = actorData.flags;

        // Add roll data for TinyMCE editors.
        context.rollData = context.actor.getRollData();

        if (actorData.type == 'pc') {

            // Initialize Containers
            const skill = [];
            const gear = [];

            let charItems = context.items;

            // Iterate through items and assign to containers
            for (let i of charItems) {
                switch (i.type) {
                    case "skill": 
                        skill.push(i)
                        break

                    case "gear": 
                        gear.push(i)
                        break
                }
            }

            // Alphabetically sort all items
            const itemCats = [skill, gear]
            for (let category of itemCats) {
                if (category.length > 1) {
                    category.sort((a,b) => {
                        let nameA = a.name.toLowerCase()
                        let nameB = b.name.toLowerCase()
                        if (nameA > nameB) {return 1}
                        else {return -1}
                    })
                }
            }

            // Assign and return items
            // let charItems = context.items;
            // context.skills = charItems.filter(i => i.type === "skill");
            // context.gear = charItems.filter(i => i.type === "gear");

            context.skills = skill
            context.gear = gear
        }

        return context;
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        if (!this.options.editable) return;

        html.find('.on-click').click(this._onRoll.bind(this));
        html.find('.inline-edit-item').blur(this._onInlineEditItem.bind(this));

        // Drag/drop support
        let handler = (ev) => this._onDragStart(ev);
        html.find('.item-block').each((i, item) => {
            if (item.dataset && item.dataset.itemId) {
                item.setAttribute('draggable', true);
                item.addEventListener('dragstart', handler, false);
            }
        });
    }



    _prepareCharacterItems(sheetData) {
      const actorData = sheetData.actor

        if (actorData.type == 'pc') {

            // Initialize Containers
            const skill = [];
            const gear = [];

            let charItems = context.items;

            // Iterate through items and assign to containers
            for (let i of charItems) {
                switch (i.type) {
                    case "skill": 
                        skill.push(i)
                        break

                    case "gear": 
                        gear.push(i)
                        break
                }
            }

            // Alphabetically sort all items
            const itemCats = [skill, gear]
            for (let category of itemCats) {
                if (category.length > 1) {
                    category.sort((a,b) => {
                        let nameA = a.name.toLowerCase()
                        let nameB = b.name.toLowerCase()
                        if (nameA > nameB) {return 1}
                        else {return -1}
                    })
                }
            }

            // Assign and return items
            actorData.skill = skill
            actorData.gear = gear
        }
      
    }




    /**
     * Handle clickable rolls.
     * @param {Event} event   The originating click event
     * @private
     */
    _onRoll(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const dataset = element.dataset;

        // Handle rolls.
        if (dataset.rollType) {
            switch (dataset.rollType) {
                case 'item-create': {
                    this._onCreateItem(dataset.type);
                    return;
                }
                case 'item-edit': {
                    this._onEditItem(dataset);
                    return;
                }
                case 'item-delete': {
                    this._onDeleteItem(dataset);
                    return;
                }
                case 'catch-breath': {
                    this.actor.catchBreath();
                    return;
                }
                case 'lay-low': {
                    this.actor.layLow();
                    return;
                }
                case 'loot-check': {
                    this._onCheckLoot();
                    return;
                }
                case 'grit-use': {
                    this._onUseGrit();
                    return;
                }
                case 'toggle-stress': {
                    this._onToggleStress(dataset.pos);
                    return;
                }
                case 'stepup': {
                    this._onStepUp(dataset);
                    return;
                }
                case 'stepdown': {
                    this._onStepDown(dataset);
                    return;
                }
                case 'use-special': {
                    this.actor.useSpecial();
                    return;
                }
                case 'use-healing': {
                    this.actor.useHealing();
                    return;
                }
                case 'roll-dice': {
                    this._onRollDice(dataset);
                    return;
                }
                default: {
                    console.error("_onRoll, bad roll type.");
                    return;
                }
            }
        }

        // Handle rolls that supply the formula directly.
        if (dataset.roll) {
            let label = dataset.label ? `[ability] ${dataset.label}` : '';
            let roll = new Roll(dataset.roll, this.actor.getRollData());
            roll.toMessage({
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                flavor: label,
                rollMode: game.settings.get('core', 'rollMode'),
            });
            return roll;
        }
    }

    _onCreateItem(iType) {
        // TODO use the Skill setting, but need a singular form for defaultName
        let defaultName = "breathless2.gen.new."+iType;

        let iData = {
            name: game.i18n.localize(defaultName),
            type: iType
        }

        return Item.create(iData, {parent:this.actor, renderSheet:false});
    }

    _onEditItem(dataset) {
        let id = dataset.itemId;
        let item = this.actor.items.get(id);

        item.sheet.render(true);
    }

    _onDeleteItem(dataset) {
        let id = dataset.itemId;

        let d = new Dialog(
            {
                title: game.i18n.localize("breathless2.dialogs.delete.title"),
                content: game.i18n.localize("breathless2.dialogs.delete.confirm"),
                buttons: {
                    one: {
                        icon: '<i class="fas fa-check"></i>',
                        label: game.i18n.localize("breathless2.dialogs.labels.yes"),
                        callback: () => { 
                            let itemToDelete = this.actor.items.get(id);
                            itemToDelete.delete();
                        }
                    },
                        two: {
                        icon: '<i class="fas fa-cancel"></i>',
                        label: game.i18n.localize("breathless2.dialogs.labels.cancel"),
                        callback: () => { return; }
                    }
                },
                default: "two"
            }
        );
        d.render(true);
    }


    _onToggleStress(pos) {
        let currentArray = this.actor.system.stress.states;
        let currentState = currentArray[pos];
        let newState = 0;

        if(currentState === false) {
            newState = true;
        } else {
            newState = false;
        }

        currentArray[pos] = newState;
        return this.actor.update({["system.stress.states"]:currentArray});
    }

    _onRollDice(dataset) {
        let id = dataset.itemId;
        return this.actor.rollDice(id);
    }

    _onStepUp(dataset) {
        let id = dataset.itemId;
        let field = dataset.field;
        return this.actor.stepUp(id, field);
    }

    _onStepDown(dataset) {
        let id = dataset.itemId;
        let field = dataset.field;
        return this.actor.stepDown(id, field);
    }

    _onInlineEditItem(e) {
        e.preventDefault();

        let el = e.currentTarget;
        let id = el.dataset.itemId;
        let field = el.dataset.field;
        let item = this.actor.items.get(id);

        return item.update({[field]:el.value});
    }

    async _onCheckLoot() {
        const loot = game.tables.filter(table => table.name === "Loot")[0];
        if(loot === undefined) {
            return ui.notifications.error(game.i18n.localize("breathless2.error.lootCheck"))
        }

        let newLoot = await loot.draw({displayChat:true});
    }

async _onUseGrit() {
        /*
        const loot = game.tables.filter(table => table.name === "Loot")[0];
        if(loot === undefined) {
            return ui.notifications.error(game.i18n.localize("breathless2.error.lootCheck"))
        }

        let newLoot = await loot.draw({displayChat:true});
        */
    }
}