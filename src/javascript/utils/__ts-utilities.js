Ext.define('TSUtilities', {

    singleton: true,

    loadWebhooks: function() {
        var deferred = Ext.create('Deft.Deferred');
        Ext.Ajax.request({
            url: '/apps/pigeon/api/v2/webhook',
            success: function(response,opts) {
                var webhooks = response.responseText && JSON.parse(response.responseText);
                deferred.resolve(webhooks.Results);
            },
            failure: function(response, opts) {
                deferred.reject(response);
            }
        });
        return deferred.promise;
    },

    loadWsapiRecords: function(config){
        var deferred = Ext.create('Deft.Deferred');
        var default_config = {
            model: 'Defect',
            fetch: ['ObjectID']
        };
        Ext.create('Rally.data.wsapi.Store', Ext.Object.merge(default_config,config)).load({
            callback : function(records, operation, successful) {
                if (successful){
                    deferred.resolve(records);
                } else {
                    console.error("Failed: ", operation);
                    deferred.reject('Problem loading: ' + operation.error.errors.join('. '));
                }
            }
        });
        return deferred.promise;
    },

    loadAStoreWithAPromise: function(model_name, model_fields){
        var deferred = Ext.create('Deft.Deferred');

        Ext.create('Rally.data.wsapi.Store', {
            model: model_name,
            fetch: model_fields
        }).load({
            callback : function(records, operation, successful) {
                if (successful){
                    deferred.resolve(this);
                } else {
                    console.error("Failed: ", operation);
                    deferred.reject('Problem loading: ' + operation.error.errors.join('. '));
                }
            }
        });
        return deferred.promise;
    }
});
