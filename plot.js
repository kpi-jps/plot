

const plot = (function () {

    /**
     * @typedef {Object} PlotSettings Scatter plot settings 
     * @property {String} font Font used in the graph text
     * @property {number} fontSize The size of the font used in the graph text
     * @property {number} width Graph width in pixels (default value = 700)
     * @property {number} height Graph height in pixels (default value = 560)
     * @property {String} xLabel The x axis label
     * @property {String} yLabel The y axis label
     * @property {boolean} grid Flag for show or not the graph grid
     * @property {number} xMax The maximum value for x axis (if undefined ou null it will be defined 
     * by max value in the data values)
     * @property {number} xMin The minimum value for x axis (if undefined ou null it will be defined 
     * by max value in the data values)
     * @property {number} yMax The maximum value for y axis (if undefined ou null it will be defined 
     * by max value in the data values)
     * @property {number} yMin The minimum value for y axis (if undefined ou null it will be defined 
     * by max value in the data values)
     * @property {number} pointSize The data point size
     * @property {number} xDecimalPlaces Number of decimal places for x axis data
     * @property {number} yDecimalPlaces Number of decimal places for y axis data
     * @property {number} graphAxisMarksInterval The interval between graph axis marks
     * @property {number} graphFrameThickness The thickness of graph frame
     * @property {number} graphAxisMarksThickness The thickness of graph axis marks
     * @property {number} graphFrameSetback The graph frame setback
     * @property {boolean} biggerMarks Flag to show or not the graph axis bigger marks
     * @property {boolean} smallerMarks Flag to show or not the graph axis smaller marks
     */

    /**
     * @typedef {Object} Data The data to be plotted
     * @property {number []} x Values of x
     * @property {number []} y Values of y
     * @property {string} color Color name or hexadecimal color code
     * @property {boolean} fill Flag to sinalize if data point is filled 
     */

    /**
     * @typedef {Object} MaxAndMinValues Maximum and minimum values of data set
     * @property {number} xMax Maximum x values for data set
     * @property {number} xMin Minimum x values for data set 
     * @property {number} yMax Maximum y values for data set
     * @property {number} yMin Minimum y values for data set
     */

    /**
     * @type {string} The svg name space
     */
    const svgNameSpace = "http://www.w3.org/2000/svg"

    /**
     * @type {PlotSettings} The default plot settings
     */
    const defaultSettings = Object.freeze({
        font: "SourceSansPro-Regular",
        fontSize: 16,
        width: 700,
        height: 560,
        legend: false,
        xLabel: "x axis",
        yLabel: "y axis",
        grid: false,
        xMax: 0,
        xMin: 0,
        yMax: 0,
        yMin: 0,
        pointSize: 2,
        xDecimalPlaces: 0,
        yDecimalPlaces: 0,
        graphAxisMarksInterval: 6,
        graphAxisMarksThickness: 2,
        graphFrameThickness: 2,
        graphFrameSetback: 4,
        biggerMarks: true,
        smallerMarks: false
    })

    /**
     * Gets a randon hexadecimal color code
     * @returns {string} The random hexadecimal color code
     */
    function getRandomHexColor() {
        const randomNumber = Math.floor(Math.random() * 16777215);
        const hexString = randomNumber.toString(16);
        const fullHexString = hexString.padStart(6, '0');
        return `#${fullHexString}`;
    }

    /**
     * Verify the plot settings
     * @param {PlotSettings} settings Plot settings
     * @returns {PlotSettings} The verified plot settings
     */
    function verifySettings(settings) {
        if (!settings) return defaultSettings
        const verified = {}
        for (const keyValue in defaultSettings) {
            //console.log(keyValue)
            if (!settings[keyValue]) {
                verified[keyValue] = defaultSettings[keyValue]
                continue
            }
            if (typeof settings[keyValue] !== typeof defaultSettings[keyValue]) throw new Error("Invalid settings!")
            verified[keyValue] = settings[keyValue]
        }
        return verified
    }

    /**
     * Verify data
     * @param {Data} data Data object containing x and y values
     * @returns {Data} The verified data object
     */
    function verifyData(data) {
        if (!data || !data.x || !data.y || !data.x instanceof Array || !data.y instanceof Array || data.x.length != data.y.length)
            throw new Error("invalid data structure!")
        if (!data.fill || typeof data.fill !== "boolean") data.fill = false
        if (!data.color) data.color = getRandomHexColor()
        return data
    }

    /**
     * Verify data set
     * @param {Data []} dataSet The data set
     * @returns {Data []} The verified data set
     */
    function verifyDataSet(dataSet) {
        const verified = []
        if (!data instanceof Array) throw new Error("Invalid data set!")
        try {
            for (const data of dataSet) verified.push(verifyData(data))
            return verified
        } catch (error) {
            throw error
        }
    }

    /**
     * Define the maximum and minimum values for a data set
     * @param {Data []} dataSet The data set
     * @param {PlotSettings} verifiedSettings The verified plot settings
     * @returns {MaxAndMinValues} The maximum and minimum values for data set
     */
    function defineMaxAndMinValuesForData(dataSet, verifiedSettings) {

        const values = {
            xMax: verifiedSettings.xMax,
            xMin: verifiedSettings.xMin,
            yMax: verifiedSettings.yMax,
            yMin: verifiedSettings.yMin
        }

        for (const data of dataSet) {
            for (const x of data.x) {
                if (x > values.xMax) values.xMax = x
                if (x < values.xMin) values.xMin = x
                //values.xMax = x > values.xMax ? values.xMax = x : values.xMax
                //values.xMin = x < values.xMin ? values.xMin = x : values.xMin
            }
            for (const y of data.y) {
                if (y > values.yMax) values.yMax = y
                if (y < values.yMin) values.yMin = y
                //values.yMax = y > values.yMax ? values.yMax = y : values.yMax
                //values.yMin = y < values.yMin ? values.yMin = y : values.yMin
            }
        }
        return values
    }

      /**
     * Creates a grapg frame
     * @param {number} width Svg element width
     * @param {number} height Svg element height
     * @param {number} gap The gap among svg limits and the graph axis
     */
    function createGraphFrame(width, height, graphFrameSetback, graphFrameThickness) {
        const setback = height > width ? height * graphFrameSetback / 100 : 2 * width * graphFrameSetback / 100
        const graphX0 = 2 * setback
        const graphY0 = graphFrameThickness + setback
        const graphWidth = width - 2 * graphX0//2 * graphFrameSetback - graphFrameThickness 
        const graphHeight = height - 2 * graphY0 //2 * graphFrameSetback - graphFrameThickness 
        const frame = document.createElementNS(svgNameSpace, "rect")
        frame.setAttributeNS(null, "id", "frame")
        frame.setAttributeNS(null, "x", graphX0)
        frame.setAttributeNS(null, "y", graphY0)
        frame.setAttributeNS(null, "width", graphWidth)
        frame.setAttributeNS(null, "height", graphHeight)
        frame.setAttributeNS(null, "fill", "white")
        frame.setAttributeNS(null, "stroke", "black")
        frame.setAttributeNS(null, "stroke-width", graphFrameThickness)
        return {
            frame: frame,
            graphX0: graphX0,
            graphY0: graphY0,
            graphHeight: graphHeight,
            graphWidth: graphWidth
        }
    }

})()
