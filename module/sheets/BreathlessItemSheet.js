export class BreathlessItemSheet extends foundry.appv1.sheets.ItemSheet {
    get template() {
        const path = 'systems/breathless2/templates/item/';
        return `${path}${this.item.type}sheet.hbs`;
    }

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['breathless2', 'sheet', 'actor', 'actor-sheet', 'item-sheet'],
            width: 400,
            left:120,
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheetbody", initial: "main"}],
            dragDrop: [{dragSelector: ".dragline", dropSelector: null}]
        });
    }

    getData () {
        const iData = this.item.system;
        iData.item = this.item;
        iData.name = this.item.name;
        iData.config = CONFIG.breathless2; 



        iData.gearchoices = [
            {key: "d4", label: "breathless2.item.d4"},
            {key: "d6", label: "breathless2.item.d6"},
            {key: "d8", label: "breathless2.item.d8"},
            {key: "d10", label: "breathless2.item.d10"},
            {key: "d12", label: "breathless2.item.d12"}
        ];

        iData.skillchoices = [
            {key: "d4", label: "breathless2.item.d4"},
            {key: "d6", label: "breathless2.item.d6"},
            {key: "d8", label: "breathless2.item.d8"},
            {key: "d10", label: "breathless2.item.d10"},
            {key: "d12", label: "breathless2.item.d12"}
        ];

        iData.initial = this.item.system.initial
        iData.current = this.item.system.current

        return iData;
    }
}