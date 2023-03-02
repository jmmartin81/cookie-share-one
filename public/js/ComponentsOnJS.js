/**
 * ComponentOnJS allow us to use react components (from microFE) on vanilla JS.
 * TODO: include link to components docs. 
 */
class ComponentsOnJS {
    /**
     * @param {String} component The component to be used. E.g: 'search-box'. This value can be extracted from the component repository name, e.g: lms.components.search-box. 
     * @param {String} rootId  The id of the div in which to mount the component. It needs to be unique.
     * @param {Object} [config] An object to set initial props. Valid props can be found on the component repository.
     * @param {Boolean} [debugMode] If set to true, a series of logs will appear on the browser console. Don't forget to remove it after use it.
     */
    constructor(component, rootId, config, debugMode) {
        this.createComponent(component, rootId)
        this.component = component
        this.rootId = rootId
        this.container = document.getElementById(rootId)
        this.baseEvent = `lms.components.${component}`
        this.debugMode = debugMode
        this.isLoaded = false
        this.props = {}
        this._onChange = []
        let $this = this
        this.container.addEventListener(`${this.baseEvent}.isLoaded`, () => this.isLoaded = true)
        this.container.addEventListener(`${this.baseEvent}.getPropsState`, e => {
            this.debug('getPropsState', e.detail)
            //WE deep copy this.props to get a previous version we can match against the incomming props on every onChange function. (Line 53)
            const prevProps = this.props ? $.extend(true, {}, this.props) : null
            Object.defineProperties(this.props, Object.keys(e.detail).reduce((acc, prop) => {
                const privateProp = `#${prop}`
                return {
                    ...acc,
                    [privateProp]: {
                        value: e.detail[prop],
                        writable: true,
                        enumerable: true,
                        configurable: true
                    },
                    [prop]: {
                        enumerable: true,
                        configurable: true,
                        get: function () {
                            return this[privateProp]
                        },
                        set: function (value) {
                            $this.eventDispatcher(prop, { [prop]: value })
                            this[privateProp] = value
                        }
                    }
                }
            }, {}))
            this.debug('this.props', this.props)
            this.debug('this._onChange', this._onChange)
            if (this._onChange) this._onChange.forEach(onChange => {
                const trackedProp = onChange.trackedProp
                if (trackedProp) return Object.keys(e.detail).forEach(prop => {
                    if (trackedProp === prop && this.isPropUpdated(prevProps[`#${prop}`], e.detail[prop])) return onChange.callback(e.detail[prop])
                })
                if (this.isPropUpdated(prevProps, e.detail)) return onChange.callback(e.detail)
            })
        })
        this.onLoad(config)
    }

    /**
     * onChange stores callback functions to be trigger whenever the component updates its props. Multiple calls of onChange can be used to set different behaviors.
     * @param {function} onChange A callback function to be call whenever the components update its props. 
     */
    onChange(onChange, trackedProp) {
        if (typeof onChange !== 'function') throw new Error('onChange should be a callback function.')
        this._onChange.push({ callback: onChange, trackedProp })
    }
    /**
     * Internal method to synchronize the component's props. Not meant to be used directly. 
     * @param {String} eventName The property name to be updated. 
     * @param {Object} values An object containing the prop and its value.
     */
    eventDispatcher(eventName, values, maxRetries = 0) {
        if (this.isLoaded) {
            this.debug('eventDispatcher eventName', eventName)
            this.debug('eventDispatcher values', values)
            this.container.dispatchEvent(new CustomEvent(`${this.baseEvent}.${eventName}`, {
                detail: values
            }))
        } else {
            if (maxRetries < 500) return setTimeout(() => this.eventDispatcher(eventName, values, maxRetries + 1), 50)
            throw new Error(`[Component failed to mount]: The component ${this.component} wasn't mount correctly on the container ${this.rootId}.`)
        }
    }
    /**
     * onLoad allows the user to set props values for the component before the component ends mounting.
     * It can be accessed from the constructor by passing the parameter "config" or directly from the instance. Eg: instanceName.onload({prop: value})
     * @param {Object} initialProps An object containing the props we wish to set.
     */
    onLoad(initialProps, maxRetries = 0) {
        if (initialProps) {
            return Object.keys(initialProps).forEach(prop => {
                if (maxRetries < 500) {
                    if (!this.isLoaded && this.props[prop] === undefined) return setTimeout(() => this.onLoad(initialProps, maxRetries + 1), 50)
                    return this.props[prop] = initialProps[prop]
                }
                throw new Error(`[onLoad ${this.component}]: ${prop} is not a valid prop.`)
            })
        }
    }
    /**
     * Internal method that import and mount the select component on the container specified from our microFE components library on AWS.S3.
     * Not meant to be used directly.
      * @param {String} component The component to be used. E.g: 'search-box'. This value can be extracted from the component repository name, e.g: lms.components.search-box. 
     * @param {String} rootId  The id of the div in which to mount the component. It needs to be unique.
     */
    createComponent(component, rootId, maxRetries = 0) {
        this.debug('createComponent', `Mounting ${component} on container with id: ${rootId}`)
        if ([...document.querySelectorAll('[id]')].filter(el => el.id === rootId).length > 1) throw new Error(`The id ${rootId} is duplicate.No duplicates ids are allowed.Please change the id of your container.`)
        const componentTemplate = document.getElementById(`${component}-js`)
        if (maxRetries > 4) {
            // Provide feedback for different errors, if the component Template is not present, it could means that some feature is missing, it would be wise to check the directory List path.
            if (!componentTemplate) throw new Error(`[createComponent', There was an error mounting ${component} on the container with id: ${rootid}. It seems the ${component} is not being imported correctly.`)
            throw new Error(`[createComponent', There was an error mounting ${component} on the container with id: ${rootid}`)
        }
        if (componentTemplate) {
            const classComponentName = component.split('-').reduce((acc, text) => acc = acc.concat(text.charAt(0).toUpperCase() + text.slice(1)), '')
            eval(`new ${classComponentName}("${rootId}")`)
            this.debug('createComponent', `${component} mounted on ${rootId}`)
        } else {
            setTimeout(() => this.createComponent(component, rootId, maxRetries + 1), 300)
        }
    }
    /**
     * Simple, internal debugger. Can be activated through the constructor.
     *  @param {Boolean} logger If set to true, a series of logs will appear on the browser console.
     * @param {*} value The content to be display on the log.
     */
    debug(logger, value) {
        if (this.debugMode) console.log(`[${logger}]`, value)
    }

    isPropUpdated(a, b) {
        const checkObjects = (a, b) => {
            let isDifference = false
            if (!Object.keys(a).length && !Object.keys(b).length) return false
            const getDifference = (prevProp, nextProp) => {
                const isObject = v => v && typeof v === 'object';
                return Object.assign(...Array.from(
                    new Set([...Object.keys(prevProp), ...Object.keys(nextProp)]),
                    k => {
                        const areObj = isObject(prevProp[k]) && isObject(nextProp[k])
                        if (!areObj && !(prevProp[k] === nextProp[k])) isDifference = true
                        return {
                            [k]: isObject(prevProp[k]) && isObject(nextProp[k])
                                ? getDifference(prevProp[k], nextProp[k])
                                : prevProp[k] === nextProp[k]
                        }
                    }
                ));
            }
            getDifference(a, b)
            return isDifference
        }
        if (typeof a !== typeof b) return true
        if ((a === null) || (b === null)) return true
        switch (typeof a) {
            case 'boolean':
            case 'number': // Numbers like 123 and 123.0 would be considered equals. If you know a way to tell the difference I would love to hear how to do it and include that logic in here.
                return checkObjects(a.toString(), b.toString())
            default: return checkObjects(a, b)
        }
    }
}

