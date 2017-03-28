Ext.define('CA.techservices.dialog.WebhookDialog',{
    extend: 'Rally.ui.dialog.Dialog',
    alias: 'tswebhookdialog',
    
    config: {
    	title: 'Webhook Editor',
    	
    	/* 
    	 * The following fields are needed for the webhook to save.
    	 * 
    	 * The fields exactly match the payload for sending to Rally.
    	 * (That's why they're capitalized.)
    	 * 
    	 */
    	Name: 'My FlowDock Webhook',
    	AppName: 'My FlowDock Integration',
    	AppUrl: 'https://www.ca.com/us/products/ca-agile-central.html',
    	TargetUrl: 'http://my.service.com/ready/to/receive/post',
    	ObjectTypes: ['HierarchicalRequirement'],
    	Expressions: []
    },
    
    constructor: function(config) {
        if (this.autoCenter) {
            this.scrollListener = Ext.create('Rally.ui.ScrollListener', this.center, this);
        }

        this.mergeConfig(config);
                
        this.width = this.width || Ext.Array.min([ 600, Ext.getBody().getWidth() - 75 ]);
        this.height = this.height || Ext.Array.min([ 400, Ext.getBody().getHeight() - 75 ]),
        
        this.callParent([this.config]);
    },

    initComponent: function() {
        var me = this;
        this.callParent(arguments);
        this.addEvents(
            /**
             * @event readytosave
             * Fires when user clicks save
             * @param {CA.techservices.dialog.WebhookDialog} source the dialog
             * @param {array} the values
             */
            'readytosave'
        );
        this._addButtons();
        this._addFields();
    },
    
    _addButtons: function() {
        this.addDocked({
            xtype: 'toolbar',
            dock: 'bottom',
            padding: '0 0 10 0',
            layout: {
                type: 'hbox',
                pack: 'center'
            },
            ui: 'footer',
            items: [{
                xtype: 'rallybutton',
                text: 'Close',
                cls: 'secondary rly-small',
                handler: this.close,
                scope: this,
                ui: 'link'
            },{
                xtype: 'rallybutton',
                itemId: 'deleteButton',
                text: 'Save',
                cls: 'primary rly-small',
                scope: this,
                disabled: false,
                handler: this._save
            }]
        });
    },
    
    _save: function() {
    	this.fireEvent('readytosave', this, this.getValues());
    	this.close();
    },
    
    getValues: function() {
    	var values = {
    			ObjectTypes: this.ObjectTypes,
    			Expressions: [{
    			      "AttributeName": "ObjectID",
    			      "Operator":      ">",
    			      "Value":         10
    			    }]
    	};
    	Ext.Array.each( this.query('component[cls=ts-editor-field-editor]'), function(editor){
    		if ( editor._fieldDef && editor._fieldDef.dataIndex ) {
    			values[editor._fieldDef.dataIndex] = editor.getValue();
    		}
    	});
    	
    	return values;
    },
    
    _getFieldValue: function(field_name) {
    	return this[field_name] || "";
    },
    
    _addFields: function() {
        var display_fields = [ 
            { text: 'App Name', dataIndex: 'AppName', editor: { xtype:'rallytextfield', height: 25 } },
            { text: 'App Url', dataIndex: 'AppUrl', editor: { xtype:'rallytextfield', height: 25 } },
            { text: 'Webhook Name', dataIndex: 'Name', editor: { xtype:'rallytextfield', height: 25 } },
            { text: 'Target Url', dataIndex: 'TargetUrl', editor: { xtype:'rallytextfield', height: 25 } },
//            { text: 'Objects', dataIndex: 'ObjectTypes', editor: { xtype:'rallytextfield', height: 25 } },
//            { text: 'Query', dataIndex: 'Expressions', editor: { xtype:'rallytextfield', height: 25 } }
        ];
        
        Ext.Array.each(display_fields, function(field) {
            this._addField(field);
        },this);
    },
    
    _addField: function(field_def) {
        var container = Ext.create('Ext.container.Container',{
            layout: { type: 'hbox'},
            cls: 'ts-editor-container'
        });
        
        container.add({
            xtype: 'container',
            html: field_def.text,
            width: 150,
            cls: 'ts-editor-field-label',
            padding: 5,
            margin: 2
        });
        
        var value = this._getFieldValue(field_def.dataIndex);
 
        container.add(Ext.apply({
        	padding: 3,
        	margin: 2,
        	value: value,
            width: 300,
            cls: 'ts-editor-field-editor',
            _fieldDef: field_def
        }, field_def.editor));
        
        this.add( container );
    }
});