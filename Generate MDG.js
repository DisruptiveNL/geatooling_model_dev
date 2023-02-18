!INC Local Scripts.EAConstants-JScript


/**************************************************************************************************
 *
 * Script Name: Generate MDG
 * Author:      Phil Chudley - Dunstan Thomas Consulting 
 * Purpose:     To generate a MDG
 *
 *              This script assumes that a manual generation has been performed so as to create
 *              profile XML files, the MTS file and the MDG file
 *
 *              If you wish to change the version of the MDG, then a manual re-generation is
 *              required
 *
 * Created:     June 2020
 * Updated:     June 2020
 * 
 *************************************************************************************************/

/*************************************************************************************************
 *
 * Global Variables and Constants
 *
 *************************************************************************************************/
 
// SQL variables
 
var sqlAliasStart = "";
var sqlAliasEnd = "";
var sqlLIKE = "";

// XML documents and nodes
var xmlDOM;			// xml document object
var xmlMTSRow;		// xml entry for MTS

// MTS Technology Node attribute names
var ID       = "id";
var NAME     = "name";
var NOTES    = "notes";
var FILENAME = "filename";

// File dialog flag settings
var DLG_MAXFILESIZE = 260;
var OF_FILEMUSTEXIST = 0x1000;
var OF_OVERWRITEPROMPT = 0x2;

// Filenames
var mtsFileName = "";

// MDG ID
var MDG_ID         = "PRCMDG";

// MDG Package Stereotypes
var PROFILE = 'profile';
var DIAGRAM = 'diagram profile';
var TOOLBOX = 'toolbox profile';

/**************************************************************************************************
 *
 * Main entry function
 *
 **************************************************************************************************/

function GenerateMDG()
{
    // Set SQL variables for DBMS independent SQL Queries
	SetSQLVariables();
	
	// Get the type of element selected in the Project Browser
	var treeSelectedType = Repository.GetTreeSelectedItemType();
	
	Repository.EnsureOutputVisible("Script");
	Repository.ClearOutput("Script");
	
	// Get the type of element selected in the Project Browser
	var treeSelectedType = Repository.GetTreeSelectedItemType();

	switch (treeSelectedType) {
		case otPackage :
		{
			// Code for when a package is selected
			var thePackage as EA.Package;
			thePackage = Repository.GetTreeSelectedObject();
			if (thePackage.IsModel) 
			{
				// Yes root node selected				
				//
				// Select the path to the MTS file
				mtsFileName = OpenMTSFile();
				
				// Filename selected?
				if (mtsFileName != "")
				{
					// Yes file name selected
					// Generate the MDG using the MTS file
					GenerateTheMDG();					
				}
				else
				{
					// No filename selected
					Session.Prompt("No MTS file was selected...\n" +
					               "... no further action taken", promptOK);
				}
			}
			else
			{	
				Session.Prompt( "The Model Root Node was not selected", promptOK );
			}			
			break;
		}
		default: 
		{
			// Error message
			Session.Prompt( "The Model Root Node was not selected", promptOK );
		}
	}
}

/**************************************************************************************************
 *
 * Helper functions
 *
 *************************************************************************************************/

/*************************************************************************************************
 *
 * Function to Generate an MDG using a given mtsFile (stored as a global variable)
 *
 * Parameters
 * ----------
 *
 * none
 *
 * Returns
 * -------
 *
 * nothing
 *
 *************************************************************************************************/
function GenerateTheMDG()
{
	// First we have to save the packages / diagrams as profiles
	//
	// We do this in the following order
	//
	// Toolboxes
	// Diagrams
	// Profiles
	
	// Find the GUIDS of profile packages
	var toolBoxPackageGUIDs = new Array();
	var diagramPackageGUIDs = new Array();
	var profilePackageGUIDs = new Array();
	
	toolBoxPackageGUIDs = GetPackageGUIDs(TOOLBOX);
	diagramPackageGUIDs = GetPackageGUIDs(DIAGRAM);
	profilePackageGUIDs = GetPackageGUIDs(PROFILE);
	
	// Iterate
	
	// Toolboxes
	for (var index = 0; index < toolBoxPackageGUIDs.length; index++)
	{
		var thePackage as EA.Package;
		thePackage =  Repository.GetPackageByGuid(toolBoxPackageGUIDs[index]);
		
		Session.Output("     Processing toolbox profile package " + thePackage.Name);
		
		// Generate XML file for all diagrams in the package
		var diagramEnumerator = new Enumerator(thePackage.Diagrams);
		while (!diagramEnumerator.atEnd())
		{
			var theDiagram as EA.Diagram;
			theDiagram = diagramEnumerator.item();
			
			Session.Output("          Generating Profile for " + theDiagram.Name);

			// Use filename as per first manual generation
			if (Repository.SaveDiagramAsUMLProfile(theDiagram.DiagramGUID, ""))
			{
				Session.Output("               XML Profile Generated");  
			}
			else
			{
				Session.Output("               XML Profile not generated");
			}

			diagramEnumerator.moveNext();
		}
	}
	
	// Diagrams
	for (var index = 0; index < diagramPackageGUIDs.length; index++)
	{
		var thePackage as EA.Package;
		thePackage =  Repository.GetPackageByGuid(diagramPackageGUIDs[index]);
		
		Session.Output("     Processing diagram profile package " + thePackage.Name);
		
		// Generate XML file for all diagrams in the package
		var diagramEnumerator = new Enumerator(thePackage.Diagrams);
		while (!diagramEnumerator.atEnd())
		{
			var theDiagram as EA.Diagram;
			theDiagram = diagramEnumerator.item();
			
			Session.Output("          Generating Profile for " + theDiagram.Name);

			// Use filename as per first manual generation
			if (Repository.SaveDiagramAsUMLProfile(theDiagram.DiagramGUID, ""))
			{
				Session.Output("               XML Profile Generated");  
			}
			else
			{
				Session.Output("               XML Profile not generated");
			} 

			diagramEnumerator.moveNext();
		}		
	}

	// Profiles
	for (var index = 0; index < profilePackageGUIDs.length; index++)
	{
		var thePackage as EA.Package;
		thePackage =  Repository.GetPackageByGuid(profilePackageGUIDs[index]);
		
		Session.Output("     Generating Profile for " + thePackage.Name);

		// Use filename as per first manual generation
		if (Repository.SavePackageAsUMLProfile(thePackage.PackageGUID, ""))
		{
			Session.Output("               XML Profile Generated");  
		}
		else
		{
			Session.Output("               XML Profile not generated");
		}			
	}

	// Finally generate the MDG
	Session.Output("     Generating the MDG with ID " + MDG_ID + " using MTS file " + mtsFileName);
	
	if (Repository.GenerateMDGTechnology(mtsFileName))
	{
		Session.Output("          MDG Generated");
	}
	else
	{
		Session.Output("          MDG not Generated");
	}
}

/**************************************************************************************************
 * 
 * Defines and provides function to set, variables for DBMS independent SQL statements
 *
 *************************************************************************************************/

/**************************************************************************************************
 *
 * Function to set the global SQL Variables according to the type of model repository we are using
 *
 * Parameters
 * ----------
 * 
 * None
 *
 *
 * Returns
 * -------
 *
 * Nothing
 *
 *************************************************************************************************/

function SetSQLVariables() {
	
	var repositoryType = Repository.RepositoryType;
	
	switch (repositoryType) {
		
		case "JET" :
			sqlAliasStart = "[";
		    sqlAliasEnd = "]";
			sqlLIKE = "ALIKE";
			break;
		case "ACCESS2007" :
			sqlAliasStart = "[";
		    sqlAliasEnd = "]";
			sqlLIKE = "ALIKE";
			break;
		case "SQLSVR" :
			sqlAliasStart = "[";
		    sqlAliasEnd = "]";
			sqlLIKE = "LIKE";
			break;
		case "MYSQL" :
			sqlAliasStart = "\"";
		    sqlAliasEnd = "\"";
			sqlLIKE = "LIKE";
			break;
		case "ORACLE" :
			sqlAliasStart = "\"";
		    sqlAliasEnd = "\"";
			sqlLIKE = "LIKE";
			break;
		default :
			break;
	}
}


/**************************************************************************************************
 *
 * Displays a Open File dialog and returns the file name that the user selected.
 * Filtered for MTS files
 *
 * Parameters
 * ----------
 * 
 * none
 *
 * Returns
 * -------
 * 
 * fileName  representing the file name that the user selected.
 *
 **************************************************************************************************/
function OpenMTSFile() {
	
	var filterString = "MTS Files (*.mts)|*.mts|";
	var	defaultFilterIndex = 1;
	var initialDir = "";
	var fileName = "";	
	var project as EA.Project;
	
	project = Repository.GetProjectInterface();
	
	var filePath = "";
	filePath = project.GetFileNameDialog(fileName, filterString, defaultFilterIndex, 
	                                     OF_FILEMUSTEXIST, initialDir, 0);
	return filePath;
}


/****************************************************************************************
 *
 * Function to return the GUIDs of all Packages with a give stereotype
 *
 * Parameters
 * ----------
 *
 * stereotype - the stereotype of the package
 *
 * Returns
 * -------
 *
 * string[]  - the GUIDs of the Packages with stereotype
 *
 ***************************************************************************************/

function GetPackageGUIDs(stereotype) 
{
	
	var guids    = new Array();
	var sqlQuery = "";
	
	// The stereotype for a pakcge is held in the Package Element, NOT the Package data
	// in the t_package table
	//
	// The reference to t_package from t-object is in the PDATA1 column
	//
	// BUT
	//
	// PDATA is a nvarchar (String) whereas t_package.Package_ID is an int !!!
	//
	// We have to use a SQL CAST, which is NOT SUPPORTED in MS ACCESS!!
	//
	// So we need two queries one for MS ACCESS (eap, eapx) and another for all other DBMS
	//
	
	// What kind of repository do we have?
	var repositoryType = Repository.RepositoryType;
	
	if (repositoryType == "JET" || repositoryType == "ACCESS2007")
	{
		sqlQuery = "SELECT t_package.ea_guid AS " + sqlAliasStart + "GUID" + sqlAliasEnd + "\n" +
		           "FROM   t_package, t_object\n" +
		           "WHERE  t_package.Package_ID = CInt(t_object.PDATA1)\n" +
		           "AND    t_object.Object_Type = 'Package'\n" +
		           "AND    t_object.Stereotype  = '" + stereotype + "'";
	}
	else
	{
		sqlQuery = "SELECT t_package.ea_guid AS " + sqlAliasStart + "GUID" + sqlAliasEnd + "\n" +
		           "FROM   t_package, t_object\n" +
		           "WHERE  t_package.Package_ID = CAST(t_object.PDATA1 AS int)\n" +
		           "AND    t_object.Object_Type = 'Package'\n" +
		           "AND    t_object.Stereotype  = '" + stereotype + "'";
		
	}
	
	var result = Repository.SQLQuery(sqlQuery);
	
	// Extract the result from the XML
	
	var xmlDOM = CreateXMLObject();
	xmlDOM.loadXML(result);
	
	if (xmlDOM != null) 
	{
		// Get the node at the specified path
		var nodePath = "/EADATA/Dataset_0/Data/Row/GUID";
		guids = XMLGetNodeTextArray(xmlDOM, nodePath);
	}
	return guids;
}

/**************************************************************************************************
 *
 * XML Functions
 *
 *************************************************************************************************/

/**************************************************************************************************
 *
 * Function to create and return an XML DOM object (used for processing result of SQL queries
 *
 * Parameters
 * ----------
 *
 * None
 *
 * Returns
 * -------
 *
 * XML DOM object
 *
 *************************************************************************************************/

function CreateXMLObject() 
{
	
	var xmlDOM;
	
	try 
	{
		xmlDOM = new ActiveObject("Microsoft.XMLDOM");
	}
	catch(e) 
	{
		xmlDOM = new ActiveXObject("MSXML2.DOMDocument.6.0");
	}
	
	xmlDOM.validateOnParse = false;
	xmlDOM.async = false;
	
	return xmlDOM;
}

/**************************************************************************************************
 *
 * Function to parses a string containing an XML document into an XML DOMDocument object.
 *
 * 
 * Parameters
 * ----------
 *
 * xmlDocument  - (String) A String value containing an XML document.
 *
 * Returns
 * -------
 *
 * XML DOMDocument representing the parsed XML Document. If the document could not be 
 * parsed, the function will return null. Parse errors will be output to Session.Output
 *
 *************************************************************************************************/
function XMLParseXML(xmlDocument)
{
	// Create a new DOM object
	var xmlDOM = CreateXMLObject();
	xmlDOM.validateOnParse = false;
	xmlDOM.async = false;
	
	// Parse the string into the DOM
	var parsed = xmlDOM.loadXML(xmlDocument);
	if (!parsed)
	{
		// A parse error occured, so output the last error and set the return value to null
		Session.Output("***** ERROR ***** " + XMLDescribeParseError(xmlDOM.parseError));
		xmlDOM = null;
	}
	
	return xmlDOM;
}

/**************************************************************************************************
 * 
 * Parses an XML file into an XML DOMDocument object.
 *
 * Parameters
 * ----------
 *
 * xmlPath  - (String) The path name to the XML file to parse.
 *
 * Returns
 * -------
 *
 * XML DOMDocument representing the parsed XML File.  If the document could not be 
 * parsed, the function will return null. Parse errors will be output to Session.Output
 *
 *************************************************************************************************/
function XMLReadXMLFromFile(xmlPath)
{
	var xmlDOM = CreateXMLObject();
	xmlDOM.validateOnParse = true;
	xmlDOM.async = true;

	var loaded = xmlDOM.load(xmlPath);
	if (!loaded)
	{
		Session.Output("***** ERROR ***** " + XMLDescribeParseError(xmlDOM.parseError));
		xmlDOM = null;
	}
	
	return xmlDOM;
}

/**************************************************************************************************
 *
 * Function to save the provided xmlDOMDocument to the specified file path.
 *
 * 
 * Parameters
 * ----------
 *
 * xmlDOM            - (MSXML2.DOMDocument) The XML DOMDocument to save
 * filePath          - (String) The path to save the file to
 * xmlDeclaration    - (Boolean) Whether the XML declaration should be included in the output file
 * indent            - (Boolean) Whether the output should be formatted with indents
 *
 * Returns
 * -------
 * 
 * nothing
 *
 *************************************************************************************************/
function XMLSaveXMLToFile(xmlDOM, filePath,	xmlDeclaration, indent)
{
	// Create the file to write out to
	var fileIOObject = new ActiveXObject("Scripting.FileSystemObject");
	var outFile = fileIOObject.CreateTextFile(filePath, true);
	
	// Create the formatted writer
	var xmlWriter = new ActiveXObject("MSXML2.MXXMLWriter");
	xmlWriter.omitXMLDeclaration = !xmlDeclaration;
	xmlWriter.indent = indent;
		
	// Create the sax reader and assign the formatted writer as its content handler
	var xmlReader = new ActiveXObject("MSXML2.SAXXMLReader");
	xmlReader.contentHandler = xmlWriter;
	
	// Parse and write the output
	xmlReader.parse(xmlDOM);
	outFile.Write(xmlWriter.output);
	outFile.Close();
}

/**************************************************************************************************
 *
 * Function to retrieve the value of the named attribute that belongs to the node at nodePath.
 *
 * Parameters
 * ----------
 *
 * xmlDOM        - (MSXML2.DOMDocument) The XML document that the node resides in
 * nodePath      - (String) The XPath path to the node that contains the desired attribute
 * attributeName - (String) The name of the attribute whose value will be retrieved
 *
 * Returns
 * -------
 *
 * String representing the value of the requested attribute
 *
 *************************************************************************************************/
function XMLGetAttributeValue(xmlDOM, nodePath, attributeName)
{
	var value = "";
	
	// Get the node at the specified path
	var node = xmlDOM.selectSingleNode(nodePath);
	if (node)
	{
		// Get the node's attributes
		var attributeMap = node.attributes;
		if (attributeMap != null)
		{
			// Get the specified attribute
			var attribute = attributeMap.getNamedItem(attributeName)
			if (attribute != null)
			{
				// Get the attribute's value
				value = attribute.value;
			}
			else
			{
				// Specified attribute not found
				System.Output("***** ERROR ***** Node at path " + nodePath + 
					" does not contain an attribute named: " + attributeName);
			}
		}
		else
		{
			// Node cannot contain attributes
			System.Output("***** ERROR ***** Node at path " + nodePath + " does not contain attributes");
		}
	}
	else
	{
		// Specified node not found
		System.Output("***** ERROR ***** Node not found at path: " + nodePath);
	}
	
	return value;
}

/**************************************************************************************************
 *
 * Function to return a description of the provided parse error
 *
 * Parameters
 * ----------
 *
 * parseError - (xmlDom.parseError) - The parseError
 *
 * Returns
 * -------
 *
 * String description of the last parse error that occured
 *
 *************************************************************************************************/
function XMLDescribeParseError(parseError)
{
	var reason = "Unknown Error";
	
	// If we have an error
	if (typeof(parseError) != "undefined")
	{
		// Format a description of the error
		reason = "XML Parse Error at [line: " + parseError.line + ", pos: " + 
			parseError.linepos + "] " + parseError.reason;
	}
	
	return reason;
}

/**************************************************************************************************
 *
 * Function to return an Array of text values corressponding to a defined XML node
 *
 * Paremeters
 * ----------
 *
 * xmlDOM - the XML DOM to be processed
 * nodePath - the XPath to the XML node for which values are to be extracted
 *
 * Returns
 * -------
 *
 * textArray - Array containing text values for the XML Node at nodePath
 *
 *************************************************************************************************/

function XMLGetNodeTextArray(xmlDOM, nodePath)  
{
	
	var nodeList = xmlDOM.documentElement.selectNodes(nodePath);
	var textArray = new Array(nodeList.length);
	
	for (var i = 0 ; i < nodeList.length ; i++) 
	{
		var currentNode = nodeList.item(i);
		textArray[i] = currentNode.text;
		
	}
	
	return textArray;
}

/**************************************************************************************************
 *
 * Function to return the text value corressponding to a defined XML nodepath
 *
 * Paremeters
 * ----------
 *
 * xmlDOM - the XML DOM to be processed
 * nodePath - the XPath to the XML node for which the value is to be extracted
 *
 * Returns
 * -------
 *
 * string containing text value for the XML Node at nodePath
 *
 *************************************************************************************************/

function XMLGetNodeText(xmlDOM, nodePath) 
{
	var value = "";
	
	// Get the node at the specified path
	var node = xmlDOM.selectSingleNode(nodePath);
	if (node != null) 
	{
		value = node.text;
	}
	else 
	{
		value = "";	
	}
	
	return value;
}
GenerateMDG();
