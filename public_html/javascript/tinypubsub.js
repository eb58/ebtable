// tiny pub/sub
(function ($) {
  const o = $({});
  $.subscribe = () => o.on.apply(o, arguments);
  $.unsubscribe = () => o.off.apply(o, arguments);
  $.publish = () => o.trigger.apply(o, arguments);
})(jQuery);
