Ext.define('CA.techservices.webhook.field.dialog.WebhookExpressionBuilder',{
    extend: 'Rally.ui.dialog.Dialog',
    alias: 'widget.tswebhookfilterfieldexpressionbuilder',
    
    config: {
    	title: 'Expression (Query)',
    	values: [],
    	models: ['HierarchicalRequirement'],
    	
    	addButtonEnabled: false,
        removeButtonEnabled: false
    },
    
    constructor: function(config) {
        if (this.autoCenter) {
            this.scrollListener = Ext.create('Rally.ui.ScrollListener', this.center, this);
        }

        this.mergeConfig(config);
                
        this.width = this.width || Ext.Array.min([ 500, Ext.getBody().getWidth() - 100 ]);
        this.height = this.height || Ext.Array.min([ 300, Ext.getBody().getHeight() - 100 ]),
        
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
             * @param {array} the values in the form: 
              [
			    {
			      "AttributeName": "PlanEstimate",
			      "Operator":      ">",
			      "Value":         10
			    },
			    {
			      "AttributeName": "Workspace",
			      "Operator":      "=",
			      "Value":         "31685839-67fe-4f9d-9470-da56c222998b"
			    }
			  ]
             */
            'readytosave'
        );
        this._addButtons();
        this._buildRows();
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
    
    _buildRows: function() {
    	this._rows = [];
    	if (this.values.length === 0) {
    		this._addRow();
    	} else {
    		Ext.Array.each(this.values, function(value) {
    			this._addRow(value);
    		},this);
    	}
    },
    
    _addRow: function(value) {
    	var row = this.add({
    		xtype:'tswebhookfilterfieldexpressionrow',
    		value: value,
    		models: this.models
    	});
    	
    	this._rows.push(row);
    },
    
    _save: function() {
    	this.fireEvent('readytosave', this, this.getValues());
    	this.close();
    },
    
    getValues: function() {
        var values = [];
        Ext.Array.each(this._rows, function(row){
        	values.push(row.getValue());
        });
        this.values = values;
        return this.values;
    }
});