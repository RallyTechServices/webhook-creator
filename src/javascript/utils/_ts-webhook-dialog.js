Ext.define('CA.techservices.dialog.WebhookDialog',{
    extend: 'Rally.ui.dialog.Dialog',
    alias: 'widget.tswebhookdialog',
    
    config: {
    	title: 'Webhook Editor',
    	
    	/* 
    	 * The following fields are needed for the webhook to save.
    	 * 
    	 * The fields exactly match the payload for sending to Rally.
    	 * (That's why they're capitalized.)
    	 * 
    	 */
        webhookConfig: {
        	Name: 'My Webhook',
        	AppName: 'My App',
        	AppUrl: 'https://www.ca.com/us/products/ca-agile-central.html',
        	TargetUrl: 'http://live-api-creator-2017-01-27.us-east-1.elasticbeanstalk.com/http/default/chxqx/rallypost',
        	ObjectTypes: ['HierarchicalRequirement'],
        	Expressions: [{
                "AttributeID": null,
                "Operator":      "=",
                "Value":         23
            }]
        }
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
        Ext.Object.each(this.webhookConfig, function(cfg_name){
            if ( this.down('#' + cfg_name) ) {
                console.log('getting value for ', cfg_name);
                console.log('value:', this.down('#'+cfg_name).getValue());
                this.webhookConfig[cfg_name] = this.down('#'+cfg_name).getValue();
            }
        },this);
        
//        this.webhookConfig.Expressions = [{
//            "AttributeID": "20bb523b-ddf3-4c82-bff5-724a1847d1cb",
////            "AttributeName": "KanbanState",
//            "Operator":      "~",
//            "Value":         [
//                "Ready To Pull",
//                "Test Planning",
//                "In Dev",
//                "Code Review",
//                "In Test"
//            ]
//        }];
        
        return this.webhookConfig;
    },
    
    _getFieldValue: function(field_name) {
    	return this.webhookConfig[field_name] || "";
    },
    
    _addFields: function() {
        var display_fields = [ 
            { text: 'App Name', dataIndex: 'AppName', editor: { xtype:'rallytextfield', height: 25 } },
            { text: 'App Url', dataIndex: 'AppUrl', editor: { xtype:'rallytextfield', height: 25 } },
            { text: 'Webhook Name', dataIndex: 'Name', editor: { xtype:'rallytextfield', height: 25 } },
            { text: 'Target Url', dataIndex: 'TargetUrl', editor: { xtype:'rallytextfield', height: 25 } },
            { text: 'Objects', dataIndex: 'ObjectTypes', editor: { 
                    xtype: 'rallycombobox',
                    allowBlank: false,
                    autoSelect: false,
                    multiSelect:true,
                    displayField: 'DisplayName',
                    valueField: 'TypePath',
                    storeConfig: {
                        model: Ext.identityFn('TypeDefinition'),
                        sorters: [{ property: 'DisplayName' }],
                        fetch: ['DisplayName', 'ElementName', 'TypePath', 'Parent', 'UserListable'],
                        filters: [{property:'UserListable',value:true}],
                        autoLoad: true,
                        remoteSort: false,
                        remoteFilter: true
                    },
                    listeners: {
                        scope: this,
                        change: this._updateModels
                    }
                
                } },
            { text: 'Query', dataIndex: 'Expressions', editor: { 
                xtype:'tswebhookfilterfield', 
                height: 25,
                models: this.webhookConfig.ObjectTypes
            } }
        ];
        
        Ext.Array.each(display_fields, function(field) {
            this._addField(field);
        },this);
    },
    
    _updateModels: function(combo,values) {
        if ( values.length > 0 ) {
            this.webhookConfig.ObjectTypes = values;
            if ( this.down('#Expressions') ) {
                this.down('#Expressions').updateModels(this.webhookConfig.ObjectTypes);
            }
        }
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
            itemId: field_def.dataIndex,
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