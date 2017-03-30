Ext.define('CA.techservices.webhook.field.WebHookFilterField',{
	extend: 'Ext.form.field.Base',
	alias: 'widget.tswebhookfilterfield',
	
	fieldSubTpl: '<div id="{id}" class="ts-webhook-filter-field"></div>',
	config: {
		width: 400,
		cls: 'ts-webhook-filter-field',
		value: undefined,
		models: undefined
	},
	
    constructor: function(config) {
        this.mergeConfig(config);
        this.callParent([this.config]);
    },
    
	onRender: function() {
		this.callParent(arguments);
		
		this._button = Ext.create('Rally.ui.Button',{
			renderTo: this.inputEl,
            text: '...',
            disabled: true,
            listeners: {
            	scope: this,
            	click: this._launchExpressionDialog
            }
		});
		
		this.updateModels(this.models);
	},
	
	updateModels: function(model_names) {
		this.models = model_names;
		this._hydrateModels(model_names).then({
			scope: this,
			success: function(models) {
				this.models = models;
				this._button.setDisabled(false);
			}
		});
	},
	
	_hydrateModels: function(models) {
		var me = this,
			promises = [];
		
		this._button.setDisabled(true);
		Ext.Array.each(models, function(model){
			if ( Ext.isString(model) ) {
				promises.push(function(){
					return me._hydrateModel(model);
				});
			}
		});
		
		return Deft.Chain.sequence(promises);
	},
	
	_hydrateModel: function(model_name) {
		var deferred = Ext.create('Deft.Deferred');
		Rally.data.ModelFactory.getModel({
		    type: model_name,
		    success: function(model) {
		    	deferred.resolve(model);
		    },
		    failure: function(msg) {
		    	deferred.reject("Problem loading " + model_name);
		    }
		});
		return deferred.promise;
	},
	
	_launchExpressionDialog: function() {
		Ext.create('CA.techservices.webhook.field.dialog.WebhookExpressionBuilder',{
			models: this.models,
			listeners: {
				scope: this,
				readytosave: function(dialog,value) {
					this.setValue(value);
				}
			}
		}).show();
	},
	
	getSubmitData: function() {
		return this._value;
	},
	
    setValue: function(value) {
        this.callParent(arguments);
        this._value = value;
    },
    
    getValue: function() {
    	return this._value;
    }
	
});