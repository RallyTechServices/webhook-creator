Ext.define("TSWebHookCreator", {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new Rally.technicalservices.Logger(),
    defaults: { margin: 10 },
    items: [
        {xtype:'container',itemId:'selector_box'},
        {xtype:'container',itemId:'display_box'}
    ],

    integrationHeaders : {
        name : "TSWebHookCreator"
    },
                        
    launch: function() {
    	this._addButtons(this.down('#selector_box'));
        
    },
      
    _addButtons: function(container) {
    	container.add({
    		xtype:'rallybutton',
    		text: 'Add WebHook',
    		listeners: {
    			scope: this, 
    			click: this._launchDialog
    		}
    	});
    },
    
    _launchDialog: function(button) {
    	Ext.create('CA.techservices.dialog.WebhookDialog', {
            listeners: {
                scope: this,
            	readytosave: function(dialog,values) {
                    this.logger.log('Values', values);
                    // todo: clean values/validate
                    
                    this._saveWebHook(values);
                }
            }
        }).show();
    },
    
    _saveWebHook: function(values){
        var me = this;
        
        me.setLoading();
        // todo: save or create
        this._createWebHook(values).always(function() { me.setLoading(false); });
    },
    
    _createWebHook: function(values) {
        // https://rally1.rallydev.com/notifications/api/v2/webhook 
        var deferred = Ext.create('Deft.Deferred');
        Ext.Ajax.request({
            url: '/notifications/api/v2/webhook',
            method: 'POST',
            jsonData: values,
            scope:this,
            success: function(response, options){
                this.logger.log('success', response, options);
                
                deferred.resolve("");
            },
            failure: function(response, options){
                this.logger.log('failed', response, options);
               
                deferred.reject("Problem saving webhook");
            }
        });
        return deferred.promise;
    },
    
    getOptions: function() {
        return [
            {
                text: 'About...',
                handler: this._launchInfo,
                scope: this
            }
        ];
    },
    
    _launchInfo: function() {
        if ( this.about_dialog ) { this.about_dialog.destroy(); }
        this.about_dialog = Ext.create('Rally.technicalservices.InfoLink',{});
    },
    
    isExternal: function(){
        return typeof(this.getAppId()) == 'undefined';
    }
    
});
