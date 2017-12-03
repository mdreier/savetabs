/**
 * This class translate HTML pages. 
 *
 * To translate a DOM element, it must have the attribute specified in
 * <code>i18nKey</code>. The value of that attribute is used as the lookup
 * key for the translation in the i18n bundle. If the attribute has the
 * special value <code>@@id</code> the id attribute of the element is 
 * used as the lookup key instead.
 *
 * The translation replaces the complete element content (<code>innerHTML</code>)
 * of the translated element. It can therefor not be used to translate
 * elements with subelements.
 */
class Translator
{
	/**
	 * Create a new <code>Translator</code> instance.
	 *
	 * @param {string} i18nKey Attribute to use as the translation key.
	 * Defaults to <code>"data-i18n-key"</code>.
	 */
	constructor(i18nKey = "data-i18n-key")
	{
		this.i18nKey = i18nKey;
	}
	
	/**
	 * Setup translation for the current document.
	 */
	static setupTranslation()
	{
		//Translate UI once document has finished loading
		window.addEventListener("load", (e) => {
			let translator = new Translator();
			translator.translate(document);
		});
	}
	
	/**
	 * Translate all elements below the given. The element passed as a
	 * parameter is not translated.
	 *
	 * @param {ParentNode} element Parent element to be used as the
	 * starting point for the translation.
	 */
	translate(element)
	{
		//Find all nodes where the i18n key attribute is set
		let selector = "[" + this.i18nKey + "]";
		let translatableNodes = element.querySelectorAll(selector);
		for (let node of translatableNodes)
		{
			if (typeof node.getAttribute === 'function')
			{
				//Determine translation key
				let translationKey = node.getAttribute(this.i18nKey);
				if (translationKey === Translator.USE_ID)
				{
					translationKey = node.id;
				}
				//Perform translation
				if (translationKey)
				{
					this._doTranslation(node, translationKey);
				}
			}
		}
	}
	
	/**
	 * Translate a single element.
	 * @param {DOMElement} element HTML element representing the menu item.
	 * @param {string} textKey Key of the translated text.
	 */
	_doTranslation(element, textKey)
	{
		if (element && element.innerHTML)
		{
			element.innerHTML = browser.i18n.getMessage(textKey);
		}
	}
}

/**
 * Constant for attribute value to use element id lookup.
 */
Object.defineProperty(Translator, 'USE_ID', {
    value: "@@id",
    writable : false,
    enumerable : true,
    configurable : false
});
