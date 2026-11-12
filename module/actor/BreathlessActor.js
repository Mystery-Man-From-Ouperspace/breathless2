export class BreathlessActor extends Actor {
 
    /** @override */
    prepareData() {
        super.prepareData();
    }

    /** @override */
    prepareDerivedData() {
        const actorData = this;
        if (actorData.type == 'pc') {
            this._preparePcData(actorData);
        }
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


        context.healingchoices = [
            {key: "0", label: "breathless2.dialogs.healing.item.zero"},
            {key: "1", label: "breathless2.dialogs.healing.item.one"},
            {key: "2", label: "breathless2.dialogs.healing.item.two"},
            {key: "3", label: "breathless2.dialogs.healing.item.three"}
        ]

        return context;
    }

    /**
     * Prepare Character type specific data
     */
    _preparePcData(actorData) {
        const systemData = actorData.system;

        const count = systemData.stress.states.filter(Boolean).length;
        systemData.stress.value = count;

        if(count >= systemData.stress.max) {
            systemData.stress.vulnerable = true;
        } else {
            systemData.stress.vulnerable = false;
        }
    }

    async rollDice(id) {
        // set some basic variables
        let outcome = "";
        // find the item's current die value, and roll it

        let die;
        let item;
        try {
            item = this.items.get(id);
            die = item.system.current;
        } catch (error) {
            if (id === "loot") {
                die = this.system.loot.current;
            } else {
                die = this.system.grit.current;
            }
        }
        
        // Item is spent, don't roll
        if (die == "--") {
            return;
        }

        // let r = await new Roll("1"+die).evaluate({ async: true });
        let r = new Roll('1'+die);
        await r.roll();

        let result = r.total;

        if (id != "loot" && id != "grit" && item.type === "gear") {

            if (result >= 5) {
                // The Item die remains unchanged
            } else if (result < 3) {
                // The Item die steps down. If it was Stressed, or would step below d4,
                // it is depleted, worn out, or consumed.
                if (item.system.stressed) {
                    item.update({"system.current":"--"});
                } else {
                    this.stepDown(id, "current");
                }
            } else {
                // The Item is marked as Stressed, but its Item die remains unchanged.
                item.update({"system.stressed":true});
            }

        } else {
            // step the die value down until reset
            this.stepDown(id, "current");
        }

        // determine the level of success
        if (result >= 5) {
            outcome = game.i18n.localize("breathless2.gen.success.full");
        } else if (result < 3) {
            outcome = game.i18n.localize("breathless2.gen.fail");
        } else {
            outcome = game.i18n.localize("breathless2.gen.success.withcost");
        }

        let image = `<img class="flex0" src="systems/breathless2/assets/dice_img/${die}.png" style="border:none" height="48" width="48">`;

        let dialogData = {}
        if (item) {
            dialogData = {
                roll_name: item.name,
                roll_type: item.type,
                roll_object: [r],
                roll_die: die,
                roll_result: result,
                roll_outcome: outcome,
                roll_die_image: image
            }
        } else {
            dialogData = {
                roll_name: id,
                roll_type: "",
                roll_object: [r],
                roll_die: die,
                roll_result: result,
                roll_outcome: outcome,
                roll_die_image: image
            }
        }

       
        this.outputChatMessage(dialogData);        
    }

    async useSpecial() {
        // Allow it to toggle back to an unused state with a simple click
        if (this.system.special.used === true) {
            this.update({"system.special.used":false});
            return;
        }

        if (game.settings.get("breathless2", "special_unrolled")) {
            this.update({"system.special.used":true});
            return;
        } 

        let outcome = "";

        // if NOT used, then roll dice and toggle to "used"
        // let r = await new Roll("1d12").evaluate({ async: true });
        let r = new Roll('1d12');
        await r.roll();

        let result = r.total;
        let die = "d12";

        // determine the level of success
        if (result >= 5) {
            outcome = game.i18n.localize("breathless2.gen.success.full");
        } else if (result < 3) {
            outcome = game.i18n.localize("breathless2.gen.fail");
        } else {
            outcome = game.i18n.localize("breathless2.gen.success.withcost");
        }

        let image = '<img src="systems/breathless2/assets/dice_img/d12.png" style="border:none" height="48" width="48">';

        let dialogData = {
            roll_name: this.system.special.game_name,
            roll_object: [r],
            roll_type: "",
            roll_die: die,
            roll_result: result,
            roll_outcome: outcome,
            roll_die_image: image
        }
       
        this.outputChatMessage(dialogData);
        this.update({"system.special.used":true});
    }

    stepUp(id, field) {
        let iType;
        let die;
        let item;
        try {
            item = this.items.get(id);
            iType = item.type;
            die = item.system[field];
        } catch (error) {
            iType = id;
            if (id === "loot") {
                die = this.system.loot[field];
            } else {
                die = this.system.grit[field]
            }
        }

        // TODO should this go to D12? It goes now !
        let stepup = "";
        switch (iType) {
            case "gear": {
                switch (die) {
                    case "d12": {
                        stepup = "d12";
                        break;
                    }
                    case "d10": {
                        stepup = "d12";
                        break;
                    }
                    case "d8": {
                        stepup = "d10";
                        break;
                    }
                    case "d6": {
                        stepup = "d8";
                        break;
                    }
                    case "d4": {
                        stepup = "d6";
                        break;
                    }
                    case "--": 
                    default: {
                        stepup = "d4";
                        break;
                    }
                }
            }; break;
            case "skill": {
                switch (die) {
                    case "d12": {
                        stepup = "d12";
                        break;
                    }
                    case "d10": {
                        stepup = "d12";
                        break;
                    }
                    case "d8": {
                        stepup = "d10";
                        break;
                    }
                    case "d6": {
                        stepup = "d8";
                        break;
                    }
                    case "d4": {
                        stepup = "d6";
                        break;
                    }
                    default: {
                        stepup = "d4";
                        break;
                    }
                }; break;
            }
            case "loot": {
                switch(die) {
                    case "d12": {
                        stepup = "d12";
                        break;
                    }
                    case "d10": {
                        stepup = "d12";
                        break;
                    }
                    case "d8": {
                        stepup = "d10";
                        break;
                    }
                    case "d6": {
                        stepup = "d8";
                        break;
                    }
                    case "d4": {
                        stepup = "d6";
                        break;
                    }
                    default: {
                        stepup = "d4";
                        break;
                    }
                }; break;
            }
            case "grit": {
                switch(die) {
                    case "d12":
                    default: {
                        stepup = "d12";
                        break;
                    }
                }; break;
            }
            default:;
        }

        console.log("stepup", stepup)

        let updateField;

        if (item) {
            updateField = `system.${field}`;
            return item.update({[updateField]:stepup});
        } else {
            switch (iType) {
              case "loot": {updateField = `system.loot.${field}`; return this.update({[updateField]:stepup}); break;};
              case "grit": {updateField = `system.grit.${field}`; return this.update({[updateField]:stepup}); break;};
              default: {return};
            }
        }

        console.log("updateField", updateField)
    }

    stepDown(id, field) {
        let iType;
        let die;
        let item;
        try {
            item = this.items.get(id);
            iType = item.type;
            die = item.system[field];
        } catch (error) {
            iType = id;
            if (id === "loot") {
                die = this.system.loot[field];
            } else {
                die = this.system.grit[field];
            }
        }
        console.log("die", die)

        let stepdown = "";
        console.log("iType", iType)
        switch (iType) {
            case "gear": {
                switch (die) {
                    case "d12": {
                        stepdown = "d10";
                        break;
                    }
                    case "d10": {
                        stepdown = "d8";
                        break;
                    }
                    case "d8": {
                        stepdown = "d6";
                        break;
                    }
                    case "d6": {
                        stepdown = "d4";
                        break;
                    }
                    case "d4":
                    default: {
                        stepdown = "--";
                        break;
                    }
                }; break;
            }
            case "skill": {
                switch(die) {
                    case "d12": {
                        stepdown = "d10";
                        break;
                    }
                    case "d10": {
                        stepdown = "d8";
                        break;
                    }
                    case "d8": {
                        stepdown = "d6";
                        break;
                    }
                    case "d6": {
                        stepdown = "d4";
                        break;
                    }
                    case "d4":
                    default: {
                        stepdown = "d4";
                        break;
                    }
                }; break;
            }
            case "loot": {
                switch(die) {
                    case "d12": {
                        stepdown = "d10";
                        break;
                    }
                    case "d10": {
                        stepdown = "d8";
                        break;
                    }
                    case "d8": {
                        stepdown = "d6"; break;
                        break;
                    }
                    case "d6": {
                        stepdown = "d4";
                        break;
                    }
                    case "d4":
                    default: {
                        stepdown = "d4";
                        break;
                    }
                }; break;
            }
            case "grit": {
                switch(die) {
                    case "d12":
                    default: {
                        stepdown = "--";
                        break;
                    }
                }; break;
            }
            default:;
        }

        console.log("stepdown", stepdown)

        let updateField;

        if (item) {
            updateField = `system.${field}`;
            return item.update({[updateField]:stepdown});
        } else {
            switch (iType) {
              case "loot": {updateField = `system.loot.${field}`; return this.update({[updateField]:stepdown}); break;};
              case "grit": {updateField = `system.grit.${field}`; return this.update({[updateField]:stepdown}); break;};
              default: {return};
            }
        }

        console.log("updateField", updateField)
    }

    layLow() {
        let stress = this.system.stress;
        let states = stress.states;
        
        // clear 1 stress
        if(states[4] == true) {
            states[4] = false;
        } else if(states[3] == true) {
            states[3] = false;
        } else if (states[2] == true) {
            states[2] = false;
        } else if (states[1] == true) {
            states[1] = false;
        } else if (states[0] == true) {
            states[0] = false;
        }
        
        this.update({"system.stress.states":states});
        this.sheet.render(true);

        let pcName = this.name;
        // notify GM that it happened
        ChatMessage.create({
            user:game.user_id,
            rollMode:'gmroll',
            whisper: ChatMessage.getWhisperRecipients("GM"),
            content: game.i18n.format('breathless2.chatMessage.layLowUsed', {pcName: pcName})
        });
    }

    catchBreath() {
        let skills = this.items;
        let special = this.system.special;

        // reset special
        if (special.used == true) {
            this.update({"system.special.used":false});
            this.sheet.render(true);
        }

        // reset all skills to initial levels
        skills.forEach(s => {
            if (s.type != "gear") {
                let init = s.system.initial;
                s.update({"system.current":init});
            }
        });

        let pcName = this.name;
        // notify GM that it happened
        ChatMessage.create({
            user:game.user_id,
            rollMode:'gmroll',
            whisper: ChatMessage.getWhisperRecipients("GM"),
            content: game.i18n.format('breathless2.chatMessage.healUsed', {pcName: pcName})
        });
    }
    
    outputChatMessage(data) {
        console.log("TESTING ---");
        console.log(data.roll_object[0]);
        console.log(data.roll_object);
        let template = 'systems/breathless2/templates/msg/chatmessage.hbs';
        foundry.applications.handlebars.renderTemplate(template, data).then((dlg) => {
            ChatMessage.create({
                user:game.user_id,
                // type:CONST.CHAT_MESSAGE_STYLES.ROLL,
                rolls: data.roll_object,
                speaker: ChatMessage.getSpeaker(),
                content: dlg
            });
        });
    }
}