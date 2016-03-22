/**
 * This widget is used to create a new phase or edit an existing one.
 */
covalic.views.EditPhaseWidget = covalic.View.extend({
    events: {
        'submit #c-phase-edit-form': function (e) {
            e.preventDefault();

            var fields = {
                name: this.$('#c-phase-name').val(),
                description: this.$('#c-phase-description').val(),
                active: this.$('#c-phase-active').is(':checked'),
                hideScores: this.$('#c-phase-hide-scores').is(':checked'),
                startDate: this.dateTimeRangeWidget.fromDateString(),
                endDate: this.dateTimeRangeWidget.toDateString(),
                type: this.$('#c-phase-training').is(':checked') ? 'training' : ''
            };

            if (this.model) {
                this.updatePhase(fields);
            } else {
                this.createPhase(_.extend({
                    challengeId: this.challenge.get('_id')
                }, fields));
            }

            this.$('button.c-save-phase').addClass('disabled');
            this.$('.g-validation-failed-message').text('');
        }
    },

    initialize: function (settings) {
        this.model = settings.model || null;
        this.challenge = settings.challenge || null;

        this.dateTimeRangeWidget = new girder.views.DateTimeRangeWidget({
            parentView: this
        });
    },

    render: function () {
        var view = this;
        var modal = this.$el.html(covalic.templates.editPhaseWidget({
            phase: this.model
        })).girderModal(this).on('shown.bs.modal', function () {
            view.$('#c-phase-name').focus();
        }).on('hidden.bs.modal', function () {
            if (view.create) {
                girder.dialogs.handleClose('create');
            } else {
                girder.dialogs.handleClose('edit');
            }
        }).on('ready.girder.modal', function () {
            if (view.model) {
                view.$('#c-phase-name').val(view.model.get('name'));
                view.$('#c-phase-description').val(view.model.get('description'));
                if (view.model.get('active')) {
                    view.$('#c-phase-active').attr('checked', 'checked');
                } else {
                    view.$('#c-phase-active').removeAttr('checked');
                }
                if (view.model.get('type') === 'training') {
                    view.$('#c-phase-training').attr('checked', 'checked');
                } else {
                    view.$('#c-phase-training').removeAttr('checked');
                }
                if (view.model.get('hideScores')) {
                    view.$('#c-phase-hide-scores').attr('checked', 'checked');
                } else {
                    view.$('#c-phase-hide-scores').removeAttr('checked');
                }

                view.dateTimeRangeWidget.setElement(view.$('#c-phase-timeframe')).render();
                view.dateTimeRangeWidget.setFromDate(view.model.get('startDate'));
                view.dateTimeRangeWidget.setToDate(view.model.get('endDate'));

                view.create = false;
            } else {
                view.create = true;
            }
        });
        modal.trigger($.Event('ready.girder.modal', {relatedTarget: modal}));
        this.$('#c-phase-name').focus();

        if (view.model) {
            girder.dialogs.handleOpen('edit');
        } else {
            girder.dialogs.handleOpen('create');
        }

        return this;
    },

    createPhase: function (fields) {
        var phase = new covalic.models.PhaseModel();
        phase.set(fields);
        phase.on('g:saved', function () {
            this.$el.on('hidden.bs.modal', _.bind(function () {
                this.trigger('g:saved', phase);
            }, this)).modal('hide');
        }, this).off('g:error').on('g:error', function (err) {
            this.$('.g-validation-failed-message').text(err.responseJSON.message);
            this.$('button.c-save-phase').removeClass('disabled');
            this.$('#c-phase-' + err.responseJSON.field).focus();
        }, this).save();
    },

    updatePhase: function (fields) {
        this.model.set(fields);
        this.model.on('g:saved', function () {
            this.$el.on('hidden.bs.modal', _.bind(function () {
                this.trigger('g:saved', this.model);
            }, this)).modal('hide');
        }, this).off('g:error').on('g:error', function (err) {
            this.$('.g-validation-failed-message').text(err.responseJSON.message);
            this.$('button.c-save-phase').removeClass('disabled');
            this.$('#c-phase-' + err.responseJSON.field).focus();
        }, this).save();
    }
});
