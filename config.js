[{
  "configurationSettings": [{
    "category": "<b>Splash Screen Settings</b>",
    "fields": [{
      "type": "string",
      "fieldName": "introTitle",
      "tooltip": "Specify Splash Screen Title",
      "label": "Title",
      "placeHolder": "Defaults to the map title"
    }, {
      "type": "string",
      "fieldName": "introText",
      "label": "Splash Screen Text",
      "tooltip": "Enter text for the splash screen",
      "stringFieldOption": "textarea",
      "placeHolder":"Defaults to the map description"
    }, {
      "type": "string",
      "fieldName": "introImage",
      "tooltip": "Url for image",
      "placeHolder": "URL to image",
      "label": "Splash Screen Image:"
    }, {
      "type": "string",
      "fieldName": "title",
      "tooltip": "Specify a title for the main page",
      "placeHolder": "Main title",
      "label": "Main title:"
    }]
  },{
    "category": "<b>Web maps to compare</b>",
    "fields": [{
      "type": "string",
      "fieldName": "webmap",
      "label": "Web Map IDs:",
      "stringFieldOption": "textarea",
      "tooltip": "Enter web map ids for maps separated by commas"
    }, {
      "type": "paragraph",
      "value": "Enter the IDs for up to three web maps, separated with a comma. The ID can be found in the URL when looking at the details page of a web map."
    }, {
      "type": "boolean",
      "fieldName": "syncMaps",
      "label": "Sync scale and location of maps",
      "tooltip": ""
    },{
      "type": "string",
      "fieldName": "tabs",
      "label": "Tab Labels:",
      "stringFieldOption": "textarea",
      "tooltip": "Enter labels for tabs separated by commas"
    }, {
      "type": "paragraph",
      "value": "Enter the labels for up to three web maps, separated with a comma. The order of the labels should be in the same order as the web maps they are associated with. All maps must have a tab label."
    }]
  }],
  "values": {

  }
}]