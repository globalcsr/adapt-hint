define(function(require) {

	var Adapt = require('coreJS/adapt');
	var Backbone = require('backbone');

	var hintExtensionView = Backbone.View.extend({

		events: {
			"click .hint-extension-button": "onSpecButtonClicked"
		},
		
		className: 'hint-extension',

		initialize: function() {
			this.render();
		},

		render: function() {
			var data = this.model.toJSON();
			var template = Handlebars.templates['hint'];

			this.$el.html(template(data)).appendTo($('.' + this.model.get('_id')));
			_.defer(_.bind(this.postRender, this));
		},

		postRender: function() {
			this.setLayout();
			this.listenTo(Adapt, 'remove', this.remove);
			this.listenTo(Adapt, 'hint-extension-widget:open', this.checkIfShouldClose);
		},

		setLayout: function() {
			if (Adapt.config.get('_defaultDirection') == 'rtl' && Adapt.device.screenSize === 'small' ) {
				$('.' + this.model.get('_id') + " .component-title-inner").css({
					paddingLeft: '35px'
				});
			} else {
				$('.' + this.model.get('_id') + " .component-title-inner").css({
					paddingRight: '35px'
				});
			}

			var $specDetail = this.$('.hint-extension-widget');

			$specDetail.velocity({ scaleX: 0, scaleY: 0 }, { duration: 1 });
		},

		onSpecButtonClicked: function(event) {
			if (event) event.preventDefault();

			var $specDetail = this.$('.hint-extension-widget');
			var closeAria = Adapt.course.get('_globals')._extensions._hint.closeButtonText;
			var openAria = Adapt.course.get('_globals')._extensions._hint.openButtonText;

			if (!$specDetail.hasClass('widget-open')) {

				$(event.currentTarget).attr({
					'aria-label': closeAria
				});
				$specDetail.velocity({
					scaleX: 1,
					scaleY: 1
				}, {
					duration: 800,
					display: 'block',
					easing: [500, 35]
				});
				$specDetail.addClass('widget-open');

				this.$('.hint-extension-button').removeClass('icon-question').addClass('icon-cross');
				Adapt.trigger('popup:opened',  this.$('.hint-extension-inner'));
				$specDetail.a11y_focus();
				Adapt.trigger('hint-extension-widget:open', this.model.get('_id'));

			} else {
				$(event.currentTarget).attr({
					'aria-label': openAria
				});
				$specDetail.velocity({
					scaleX: 0,
					scaleY: 0
				}, {
					duration: 300,
					display: 'none'
				});
				$specDetail.removeClass('widget-open');

				this.$('.hint-extension-button').removeClass('icon-cross').addClass('icon-question');
				 Adapt.trigger('popup:closed',  this.$('.hint-extension-inner'));
			}
		},

		checkIfShouldClose: function(id) {
			if (this.model.get('_id') !== id) {
				var $widget = $('.' + this.model.get('_id') + " .hint-extension-widget");
				var $button = $('.' + this.model.get('_id') + " .hint-extension-button");

				$widget.velocity({
					scaleX: 0,
					scaleY: 0
				}, {
					duration: 300,
					display: 'none'
				});

				$widget.removeClass('widget-open');
				$button.removeClass('icon-cross').addClass('icon-question');
			}
		}
	});

	Adapt.on('componentView:postRender', function(view) {
		if (view.model.has('_hint') && view.model.get('_hint').length > 0) {
			new hintExtensionView({
				model: view.model
			});
		}
	});

});
