﻿var nBraneAdminSuiteMainViewModel = function () {
    var self = this;
	self.CurrentAction = ko.observable('none');
	self.CurrentSubaction = ko.observable('none');
	
    self.Load = function (item, event) {
        self.ToggleLoadingScreen(true);
		
        var listItem = event.target;
        if (listItem.nodeName != "li" && listItem.nodeName != "LI") {
            listItem = event.target.parentNode;
        }

        self.CloseSubMenu();
		
        $(listItem).addClass('selected');
		self.CurrentAction($(listItem).data('action'));
		self.CurrentSubaction($(listItem).data('subaction'));

		if (self.CurrentAction() != undefined){
			self.ServerCallback('load', 'Name=' + self.CurrentAction(), function (serverData) {
				var decoded = $('<div/>').html(serverData.HTML).text();
				$('.nbr-admin-suite').append(decoded);
				
				if (serverData.JS){
					$('<script>').attr('type', 'text/javascript')
						.text(serverData.JS)
						.appendTo('head');
				}

			}, function(xhr, status, thrown){

				self.ToggleConfirmScreen('Sorry, We ran into a problem.', status + ': ' + thrown);
				self.CloseSubMenu();
			}
			);
		} else {
			self.ToggleLoadingScreen(false);
		}
        
    };
	
	self.Logoff = function (){
		self.ToggleLoadingScreen(true);
		
		self.ServerCallback('Logoff', null, function (serverData) {
				location.reload();
			}, function(xhr, status, thrown){
				self.ToggleConfirmScreen('Sorry, We ran into a problem.', status + ': ' + thrown);
			}
		);
	};
	
	self.SwitchInto = function (){
		self.ToggleLoadingScreen(true);
		
		var listItem = event.target;
        if (listItem.nodeName != "li" && listItem.nodeName != "LI") {
            listItem = event.target.parentNode;
        }

		self.ServerCallback('SetUserMode', 'mode=' + $(listItem).data('action'), function (serverData) {
				location.reload();
			}, function(xhr, status, thrown){
				self.ToggleConfirmScreen('Sorry, We ran into a problem.', status + ': ' + thrown);
			}
		);
	};

    self.CloseSubMenu = function () {
        $('.nbr-sub-menu').remove();
        $('.nbr-control-panel li').removeClass('selected');
    };

    self.ToggleLoadingScreen = function (visibility) {
        if (visibility) {
            $('html').block({
                 css: {
					'position': 'fixed',
                    'top': '30%',
                    'border': '#009344 7px solid',
                    'width': '200px',
                    'height': '140px !important',
                    'padding': '15px 15px 30px',
                    'backgroundColor': '#fff',
                    'color': '#000',
                    '-webkit-border-radius': '15px',
                    '-moz-border-radius': '15px'
                },
                message: $(".nbr-admin-suite-loading"),
                'centerX': true,
                'centerY': false
            });
        } else {
            $('html').unblock();
        }
    };

	self.ToggleConfirmScreen = function(message, subMessage, okAction) {
        $('html').block({
            css: {
				'position': 'fixed',
				'top': '30%',
				'border': '#FFCA00 7px solid',
				'width': '450px',
				'height': '140px !important',
				'padding': '15px 15px 30px',
				'backgroundColor': '#fff',
				'color': '#000',
				'-webkit-border-radius': '15px',
				'-moz-border-radius': '15px'
            },
            message: $(".nbr-admin-suite-confirm"),
                'centerX': true,
                'centerY': false
        });

        $("#messagePlaceholder").html(message);
        $("#subMessagePlaceholder").html(subMessage);

        $('#yesButton').click(function (event) {
            event.preventDefault();
            $('html').unblock();

            if (okAction && $.isFunction(okAction)) {
                okAction();
            }

            $(this).unbind('click');
        });

        $('#noButton').click(function (event) {
            event.preventDefault();
            $('html').unblock();
        });
		
		if (!okAction){
			$('#yesButton').hide();
			$('#noButton').text('Close & Continue');
		} else {
			$('#yesButton').show();
			$('#noButton').text('No');
		}
    };

    self.ServerCallback = function (func, parameters, success, failure, complete, method) {

        var service = $.dnnSF();
        var serviceUrl = service.getServiceRoot('nbrane/administrationsuite') + 'ControlPanel/' + func;

        method = method || "GET";

        $.ajax({
            url: serviceUrl,
            beforeSend: service.setModuleHeaders,
            cache: false,
            contentType: 'application/json; charset=UTF-8',
            type: method,
            data: parameters,
            success: success,
            error: failure,
            complete: complete
        });
    }
};

var nBraneAdminSuiteNode = null;
$(document).ready(function () {
    nBraneAdminSuiteNode = document.getElementById('nbr-admin-suite');
    if (nBraneAdminSuiteNode) {
        ko.cleanNode(nBraneAdminSuiteNode);

        var koViewModel = new nBraneAdminSuiteMainViewModel();
        ko.applyBindings(koViewModel, nBraneAdminSuiteNode);
    }
	
	$(".nbr-upper-control-panel li").hover(
		function() {
			var targetWidth = $(this).children('span').outerWidth() +30;
			$(this).animate({width:targetWidth}, 350);
		},
		function() {
		$(this).animate({width:'20px'}, 50);
		});
});