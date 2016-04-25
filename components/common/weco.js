'use strict';

module.exports = function (document, componentName, component) {
  const localDoc = (document._currentScript || document.currentScript).ownerDocument;
  const template = localDoc.querySelector('template').content;
  const proto = Object.create(HTMLElement.prototype, {
    createdCallback: {
      value: function() {
        const shadowRoot = this.createShadowRoot();
        const clone = localDoc.importNode(template, true);
        component.created(clone);
        shadowRoot.appendChild(clone);
      }
    }
  });
  document.registerElement(componentName, {prototype: proto});
};
