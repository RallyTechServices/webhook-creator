Ext.define('CA.techservices.wehook.field.ExpressionRow',{
    extend: 'Ext.container.Container',
    alias: 'widget.tswebhookfilterfieldexpressionrow',
    layout: 'hbox',
    cls: 'advanced-filter-row',

    minHeight: 50,

    config: {
    	models: ['HierarchicalRequirement'],
    	context: undefined,
    	value: { AttributeName: undefined, Operator: undefined, Value: undefined }
    },
    
    constructor: function(config) {
        this.mergeConfig(config);
        if ( ! this.value ) {
        	this.value = { AttributeName: undefined, Operator: undefined, Value: undefined };
        }
        this.callParent([this.config]);
    },

    initComponent: function() {
        this.callParent(arguments);
        this._createItems();
    },

    _createItems: function() {
//        this._createAddRowButton();
//        this._createRemoveRowButton();
//        this._createIndexLabel();
        this._createAttributeField();
        this._createOperatorField();
        this._createValueField();

        return [
            this.addRowButton,
            this.removeRowButton,
//            this.indexLabel,
            this.attributeField,
            this.operatorField,
            this.valueField
        ];
    },

    _createAddRowButton: function() {
        this.addRowButton = this.add({
            xtype: 'rallybutton',
            itemId: 'addRowButton',
            cls: 'primary rly-small icon-plus filter-row-control',
            margin: '0 5px 0 0',
            disabled: !this.addButtonEnabled,
            listeners: {
                click: this._addRow,
                buffer: 200,
                scope: this
            }
        });
    },

    _createRemoveRowButton: function() {
        this.removeRowButton = this.add({
            xtype: 'rallybutton',
            itemId: 'removeRowButton',
            userAction: 'Remove filter row clicked',
            cls: 'primary rly-small icon-minus filter-row-control',
            margin: '0 10px 0 0',
            disabled: false,
            listeners: {
                click: this._removeRow,
                buffer: 200,
                scope: this
            }
        });
    },

    _createAttributeField: function() {
        this.attributeField = this.add(Ext.merge({
            xtype: 'tsattributefieldcombobox',
            itemId: 'attributeField',
            autoExpand: this.autoExpand,
            cls: 'indexed-field property-field',
            width: 150,
            labelAlign: 'top',
            fieldLabel: 'Attribute',
            labelSeparator: '',
            emptyText: 'Choose Field...',
            value: this.value && this.value.AttributeName,
            models: this.models,
            listeners: {
                select: this._onAttributeSelect,
                scope: this
            }
        }, this.attributeFieldConfig));
    },
    
    _onAttributeSelect: function() {
        Deft.Promise.all([
            this._replaceOperatorField(),
            this._replaceValueField()
        ],this).then({
            success: function() {
                this.valueField.focus(false, 200);
            },
            scope: this
        });
    },
    
    _createOperatorField: function() {
    	this.operatorField = this.add(Ext.merge({
            xtype: 'rallyoperatorfieldcombobox',
            itemId: 'operatorField',
            cls: 'operator-field',
            width: 85,
            autoExpand: this.autoExpand,
            labelAlign: 'top',
            fieldLabel: 'Operator',
            labelSeparator: '',
            matchFieldWidth: true,
            disabled: !(this._hasAttributeSelected()),
            property: this._hasAttributeSelected() ? this.attributeField.getValue() : undefined,
            value: this.operator,
            model: this.models[0],
            context: this.context,
            additionalOperators: [{ displayName:'changed-to', name: 'changed-to'},{displayName:'changed-from', name: 'changed-from'}]
//            listeners: {
//                select: this._onOperatorSelect,
//                scope: this
//            }
        }, this.operatorFieldConfig));
    },
    
    _replaceOperatorField: function() {
        var deferred = new Deft.Deferred();
        delete this.operator;
        this.operatorField.destroy();
        this._createOperatorField();
        this.operatorField.store.on('load', function() {
            deferred.resolve();
        });
        //this.add(this.operatorField);
        return deferred.promise;
    },

    _createValueField: function() {
        var fieldConfig = {},
            initialValue = this.value && this.value.Value,
            field;

        if (this._hasAttributeSelected()) {
            var model = this.models[0],
                property = this.attributeField.getValue();

            field = model.getField(property);

            if (field.isDate() && initialValue) {
                initialValue = Rally.util.DateTime.fromIsoString(initialValue);
            }

            Ext.apply(fieldConfig, Rally.ui.inlinefilter.FilterFieldFactory.getFieldConfig(model, property, this.context));

            initialValue = Rally.ui.inlinefilter.FilterFieldFactory.getInitialValueForLegacyFilter(fieldConfig, initialValue);
            fieldConfig = Rally.ui.inlinefilter.FilterFieldFactory.getFieldConfigForLegacyFilter(fieldConfig, initialValue);

            if (this._shouldApplyFiltersOnSelect(property)) {
                Ext.merge(fieldConfig, {
                    autoExpand: this.autoExpand && this._shouldAutoExpand(field),
                    autoSelect: true,
                    enableKeyEvents: true
                });
            } else if (field.isDate()) {
                Ext.merge(fieldConfig, {
                    validateOnChange: true,
                    enableKeyEvents: true,
                    listeners: {
                        focus: function(datefield) {
                            if (this.autoExpand) {
                                datefield.expand();
                            }
                        },
                        scope: this
                    }
                });
            } 
        }

        Ext.merge(fieldConfig, {
            xtype: fieldConfig.xtype || 'textfield',
            itemId: 'valueField',
            cls: 'value-field',
            height: 40,
            flex: 1,
            labelAlign: 'top',
            fieldLabel: 'Value',
            labelSeparator: '',
            hideLabel: false,
            forceSelection: true,
            allowBlank: field && this._allowBlank(field),
            allowClear: false,
            multiSelect: false,
            disabled: !(this._hasAttributeSelected()),
            isValid: function(preventMark) {
                var pm = this.preventMark, isValid;
                if (preventMark) {
                    this.preventMark = true;
                }
                isValid = this.superclass.isValid.apply(this, arguments);
                this.preventMark = pm;
                return isValid;
            }
        });

        if (!_.isUndefined(initialValue)) {
            Ext.merge(fieldConfig, {
                value: initialValue
            });
        }

        this.valueField = this.add(fieldConfig);
    },

    _replaceValueField: function() {
        delete this.rawValue;
        this.valueField.destroy();
        this._createValueField();
        //this.add(this.valueField);
        return Deft.Promise.when();
    },

    _shouldApplyFiltersOnSelect: function(fieldName) {
        var field = this.models[0].getField(fieldName),
            attributeDefinition = field && field.attributeDefinition;

        return attributeDefinition && (attributeDefinition.Constrained || field.isObject() || field.isBoolean());
    },
    
    disableAddRow: function() {
        this.addRowButton.disable();
    },

    enableAddRow: function() {
        this.addRowButton.enable();
    },

    _addRow: function() {
        this.fireEvent('addrow', this);
    },

    _removeRow: function(autoFocus) {
        this.fireEvent('removerow', this, {autoFocus: autoFocus !== false });
    },

    isValid: function() {
        return this._hasAttributeSelected() && this._hasOperatorSelected() ; //&& this._valueFieldIsValid();
    },
    
    getValue: function() {
    	if ( !this.isValid() ) {
    		return undefined;
    	}
    	this.value = { 
            AttributeName: this.attributeField.getValue(), 
            Operator: this.operatorField.getValue(), 
            Value: this.valueField.getValue() 
        };
    	return this.value;
    },
    
    _hasAttributeSelected: function() {
        return this.attributeField && !!this.attributeField.getValue();
    },

    _hasOperatorSelected: function() {
        return this.operatorField && !!this.operatorField.getValue();
    },

    _allowBlank: function(field) {
        if (field && !field.attributeDefinition.Required && !field.attributeDefinition.Constrained) {
            return ['date', 'quantity', 'integer', 'string'].indexOf(field.getType()) !== -1;
        }
        return false;
    },

    _shouldAutoExpand: function(field) {
        return !((field.isObject() || field.isCollection()) && field.getAllowedValueType() !== 'user');
    }
    
});