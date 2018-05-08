Ext.define("CArABU.app.WebhookCreator", {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new CArABU.technicalservices.Logger(),
    defaults: { margin: 10 },
    layout: 'border',

    items: [
        {xtype:'container',flex: 1, itemId:'grid_box1', region: 'center'},
    ],

    integrationHeaders : {
        name : "CArABU.app.WebhookCreator"
    },

    launch: function() {
        var me = this;
        this.setLoading("Loading stuff...");

        this.logger.setSaveForLater(this.getSetting('saveLog'));

        TSUtilities.loadWebhooks().then({
            scope: this,
            success: function(results) {
                var fields = [
                    'ObjectUUID',
                    'Name',
                    'Expressions',
                    'Disabled',
                    'TargetUrl',
                    'ObjectTypes',
                    'CreationDate',
                    'LastUpdateDate'
                ];
                this._displayGridGivenRecords(results,fields);
            },
            failure: function(error_message){
                alert(error_message);
            }
        }).always(function() {
            me.setLoading(false);
        });
    },

    _displayGridGivenRecords: function(records,field_names){
        var store = Ext.create('Rally.data.custom.Store',{
            data: records
        });

        this.logger.log(records);

        var cols = Ext.Array.map(field_names, function(name){
            return {
                dataIndex: name,
                text: name,
                flex: 1 ,
                renderer: function(value){
                    if ( Ext.isArray(value) ) {
                        if ( value[0] && Ext.isObject(value[0]) && !Ext.isArray(value[0])) {
                            return JSON.stringify(value);
                        }
                        return value.join(', ');
                    }
                    if ( Ext.isObject(value) ) {
                        return JSON.stringify(value);
                    }
                    return value;
                }
            };
        });
        this.down('#grid_box1').add({
            xtype: 'rallygrid',
            store: store,
            columnCfgs: cols,
            showRowActionsColumn: false
        });
    },

    getSettingsFields: function() {
        var check_box_margins = '5 0 5 0';
        return [{
            name: 'saveLog',
            xtype: 'rallycheckboxfield',
            boxLabelAlign: 'after',
            fieldLabel: '',
            margin: check_box_margins,
            boxLabel: 'Save Logging<br/><span style="color:#999999;"><i>Save last 100 lines of log for debugging.</i></span>'

        }];
    },

    getOptions: function() {
        var options = [
            {
                text: 'About...',
                handler: this._launchInfo,
                scope: this
            }
        ];

        return options;
    },

    _launchInfo: function() {
        if ( this.about_dialog ) { this.about_dialog.destroy(); }

        this.about_dialog = Ext.create('Rally.technicalservices.InfoLink',{
            showLog: this.getSetting('saveLog'),
            logger: this.logger
        });
    },

    isExternal: function(){
        return typeof(this.getAppId()) == 'undefined';
    }

});
