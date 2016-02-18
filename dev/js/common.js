/// <reference path="Framework/Events.ts" />
requirejs.config({
    baseUrl: '/assets/js/',
    paths: {
        jquery: '//cdnjs.cloudflare.com/ajax/libs/jquery/2.2.0/jquery.min',
        ymaps: '//api-maps.yandex.ru/2.1/?lang=ru_RU',
        fancybox: 'lib/fancybox/jquery.fancybox.pack',
        inputmask: '//cdnjs.cloudflare.com/ajax/libs/jquery.inputmask/3.2.7/jquery.inputmask.bundle.min',
        helperPage: 'helper-page'
    },
    shim: {
        'jquery': {
            exports: 'jQuery'
        },
        'fancybox': {
            exports: 'fancybox',
            deps: ['jquery']
        },
        'inputmask': {
            exports: 'inputmask',
            deps: ['jquery']
        },
        'ymaps': {
            exports: 'ymaps'
        },
        'helperPage': {
            deps: ['jquery', 'ymaps', 'fancybox','inputmask'],
            exports: 'helperPage'
        }
    },
    deps: ['helperPage']
});
