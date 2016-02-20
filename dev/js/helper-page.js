var myMap,
	myPlacemark;
function init(){
	myMap = new ymaps.Map("ymap", {
		center: [59.851598,30.313955],
		zoom: 16,
		controls: []
	}, {}),
	myPlacemark = new ymaps.Placemark(myMap.getCenter(), {
				// hintContent: 'Собственный значок метки',
				// balloonContent: 'Это красивая метка'
		}, {
			// Опции.
			// Необходимо указать данный тип макета.
			iconLayout: 'default#image',
			// Своё изображение иконки метки.
			iconImageHref: '/landings/kursy-study/assets/img/map-label.png',
			// Размеры метки.
			iconImageSize: [84, 84],
			// Смещение левого верхнего угла иконки относительно
			// её "ножки" (точки привязки).
			iconImageOffset: [-42, -42]
		});
	myMap.geoObjects.add(myPlacemark);
}

var clickAnckers = function(){
	$(document).on('click','.anckers__item', function(e){
		e.preventDefault();

		var target = $(this).data('target');
		console.log(target);
		if ( typeof $(target).offset() != "undefined" )
			$('html,body').stop().animate({'scrollTop':$(target).offset().top-parseInt($('body').css('paddingTop'))}, 'normal');
	});
};

var masks = function(){
		$(":input").inputmask({
				showMaskOnHover: false,
				onincomplete: function(){
						$(this).addClass('error')
				},
				oncomplete: function(){
						$(this).removeClass('error')
				}
		});
	return this
};

var submitForm = function(){
	$('#form_subm .btn').click(function(e){
		e.preventDefault();
		$.ajax({
			  "url" : "/mail.php",
			  "method" : "POST",
			  "data": $('#form_subm').serialize()
		  }).done(function(){
			  $('.seen-inputs').removeClass('error seen-inputs')
			  $form[0].reset();
			  $('body').addClass('fancybox-margin fancybox-lock');
			 	$.fancybox.close();
		  }).error(function(){
			  console.log("error send");
		  });
	});
};
// DOM READY
$(function () {
	$(".fancy").fancybox({
		openEffect: 'fade',
		helpers: {
	    overlay: {
	      		locked: false
		    }
		  }
	});
	ymaps.ready(init);
	clickAnckers();
	masks();
	submitForm();
}());
