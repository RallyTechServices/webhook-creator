Ext.define('CA.techservices.webhook.field.AttributeFieldComboBox', {
        alias: 'widget.tsattributefieldcombobox',
        extend: 'Rally.ui.combobox.ComboBox',
        requires: [
            'Ext.XTemplate',
            'Rally.data.wsapi.ModelBuilder',
            'Rally.ui.renderer.FieldDisplayNameRenderer'
        ],

        defaultBlackListFields: ['DirectChildrenCount', 'DisplayColor', 'DragAndDropRank', 
        	'ObjectUUID', 'Subscription', 'TestCase', 'TestCaseResult', 'VersionId', 'ObjectID',
        	'SchemaVersion'],
        defaultWhiteListFields: ['Workspace','ObjectID'],

        config: {
            autoExpand: true,
            defaultSelectionPosition: null,
            displayField: 'displayName',
            valueField: 'name',
            models: undefined,
            context: undefined,
            listConfig: {
                hideMode: 'display',
                itemTpl: new Ext.XTemplate(
                    '{displayName}',
                    '<tpl if="this.hasModelNames(values)">',
                    '<div class="duplicate-field-model-name">- {modelNames}</div>',
                    '</tpl>',
                    {
                        hasModelNames: function (data) {
                            return data.modelNames.length > 0;
                        }
                    })
            },

            /**
             * @cfg {String[]} blackListFields
             * field names that should be excluded from the filter row field combobox
             */
            blackListFields: [],

            /**
             * @cfg {String[]} whiteListFields
             * field names that should be included from the filter row field combobox
             */
            whiteListFields: [],

            /**
             * @cfg {String[]} additionalFields
             * fields that should be included in addition to the model fields
             */
            additionalFields: []
        },

        constructor: function(config) {
            this.mergeConfig(config);
            this.config.store = this._getFilterableFieldsStore();
            this.callParent([this.config]);
        },

        _getFilterableFieldsStore: function(){
            return {
                fields: ['displayName', 'modelNames', 'name'],
                data: this._getFilterableFields()
            };
        },

        _getFilterableFields: function() {
            var fields = _.filter(this._getAllFields(), this._shouldShowField, this);

            return _(fields).map(function(field) {
                return {
                    displayName: Rally.ui.renderer.FieldDisplayNameRenderer.getDisplayName(field),
                    modelNames: this._getModelNamesForDuplicates(field, fields),
                    name: field.name
                };
            }, this).sortBy('displayName').value();
        },

        _getAllFields: function() {
        	var fields = {};
        	Ext.Array.each(this.models, function(model) {
        		fields = _.merge({},model.getFields());
        	});
        	
            return _.merge(fields, this.additionalFields);
        },

        _getModelNamesForDuplicates: function(field, fields) {
            var fieldCounts = _.countBy(fields, 'displayName');
            if (fieldCounts[field.displayName] > 1) {
                return _.pluck(this.model.getModelsForField(field), 'displayName').join(', ');
            }
            return '';
        },

        _shouldShowField: function(field) {
            var blackListFields = _.union(this.blackListFields, this.defaultBlackListFields),
                whiteListFields = _.union(this.whiteListFields, this.defaultWhiteListFields),
                isBlackListed = _.contains(blackListFields, field.name),
                isWhiteListed = _.contains(whiteListFields, field.name),
                isAdditionalField = _.contains(_.map(this.additionalFields, 'name'), field.name),
                isFilterable = false,
                isMultiValueCustom = false;

                if (field.attributeDefinition) {
                    isFilterable = field.attributeDefinition.Filterable;
                    isMultiValueCustom = field.isMultiValueCustom();
                }

            return isWhiteListed || (isAdditionalField && !isBlackListed) || (isMultiValueCustom && !isBlackListed && !field.hidden) || (isFilterable && !isBlackListed && !field.hidden && !field.isCollection());
        }
    });