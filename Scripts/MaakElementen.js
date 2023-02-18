!INC Local Scripts.EAConstants-JScript


/**************************************************************************************************
 *
 * Script Name: Maak Elementen
 * Author:      Ben van der Veen - Disruptive Solutions
 * Purpose:     Maak elementen nadat je de typeduiding hebt gemaakt bij een Uitspraak
 *
 * Created:     Maart 2021
 * Updated:     Maart 2021
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
var MDG_ID         = "GEA";

// MDG Package Stereotypes
var GEAFRAMEWORK = 'GEA Framework';
var BELEIDSUITSPRAKEN = 'Beleidsuitspraken';
var UITSPRAKEN = 'Uitspraken';
var PERSPECTIEF = 'Perspectief';
var TYPEVORMGEVING = 'Type Vormgeving';
var TYPEZINGEVING = 'Type Zingeving';

/**************************************************************************************************
 *
 * Main entry function
 *
 **************************************************************************************************/

function MaakElementen()
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
				
				var geaFrameworkPack as EA.Package;
				geaFrameworkPack = thePackage.Packages.GetByName( GEAFRAMEWORK );
				
				var uitsprakenPack as EA.Package;
				uitsprakenPack = geaFrameworkPack.Packages.GetByName( UITSPRAKEN );
				
				var uitspraakElementen as EA.Element;
				uitspraakElementen = uitsprakenPack.Elements;
				
				//Session.Prompt("Elements [ " + uitspraakElementen.Count +
				//	               " ]\n", promptOK);
				
				var beleidsUitsprakenCounter = 0;
				
				for (var index = 0; index < uitspraakElementen.Count; index++)
				//for (var index = 0; index < 20; index++)
				{
				
					var elem as EA.Element;
					elem = uitsprakenPack.Elements.GetAt(index);
					
					var typeVormgeving = elem.TaggedValues.GetByName( TYPEVORMGEVING ).Value;
					
					if ( typeVormgeving == "Beleidsuitspraak" )
					{
					
						//Session.Output( " [ " + elem.TaggedValues.GetByName( TYPEVORMGEVING ).Value +
					    //           " ]\n");
						//Session.Output( " [ " + elem.TaggedValues.GetByName( TYPEZINGEVING ).Value +
					    //           " ]\n");
						
						var typeZingeving = elem.TaggedValues.GetByName( TYPEZINGEVING ).Value;
						var typeVormgeving = elem.TaggedValues.GetByName( TYPEVORMGEVING ).Value;
						
						
						var packageBeleidsuitspraken as EA.Package;
						packageBeleidsuitspraken = geaFrameworkPack.Packages.GetByName( BELEIDSUITSPRAKEN );
						
						var newElement as EA.Element;
						newElement = packageBeleidsuitspraken.Elements.AddNew ("BEL.UITPSRAAK_"+beleidsUitsprakenCounter, "Beleidsuitspraak");
						newElement.Notes = elem.Name;
						
						if (typeVormgeving == 'Zingeving')
						{	
							for (var index2 = 0; index2 < newElement.TaggedValues.Count; index2++)
							{		
								var tagNiveau as EA.TaggedValue;
								tagNiveau = newElement.TaggedValues.GetAt( index2 );
								if (tagNiveau.Name == 'Niveau')
								{
									tagNiveau.Value = 'Zingeving'
								}
								tagNiveau.Update ();
							}
							
						}
						else
						{
							for (var index2 = 0; index2 < newElement.TaggedValues.Count; index2++)
							{		
								var tagNiveau as EA.TaggedValue;
								tagNiveau = newElement.TaggedValues.GetAt( index2 );
								if (tagNiveau.Name == 'Niveau')
								{
									tagNiveau.Value = 'Vormgeving'
								}
								tagNiveau.Update ();
							}
						}
						
						newElement.Update ();			
						
						packageBeleidsuitspraken.Elements.Refresh ();
						//Repository.RefreshModelView (packageBeleidsuitspraken.PackageID);
						
						beleidsUitsprakenCounter++;
						
					}
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
function GenereerElementen()
{
	// First we have to save the packages / diagrams as profiles
	//
	// We do this in the following order
	//
	// Toolboxes
	// Diagrams
	// Profiles
	
	// Find the GUIDS of profile packages
	var uitsprakenPackageIDs = new Array();
	
	var theModel as EA.Package;
	theModel = Repository.Models.GetByName("GEA Framework");
	
	Session.Output("     Processing toolbox profile package " + theModel.Packages.Count);

	var uitsprakenPack as EA.Package;
	uitsprakenPack = theModel.Packages.GetByName(UITSPRAKEN);
	
	//uitsprakenPackageIDs = Repository.GetPackageByID(UITSPRAKEN);
	
	Session.Output("     Processing toolbox profile package " + uitsprakenPack.Name);
	
	// Iterate
	
	// Toolboxes
	//for (var index = 0; index < uitsprakenPackageIDs.length; index++)
	//{
		//var thePackage as EA.Package;
		//thePackage =  Repository.GetPackageByGuid(uitsprakenPackageIDs[index]);
		
		//Session.Output("     Processing toolbox profile package " + thePackage.Name);
		
		// Lees alle Tags met typeduiding: Niveau, Perspectief, Type Vormgeving, Type Zingeving
		

	//}
	
	
	// Finally generate the MDG
	
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

function GetPackageTags(stereotype) 
{
	
	var ids    = new Array();
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
		ids = XMLGetNodeTextArray(xmlDOM, nodePath);
	}
	return ids;
}

//GenereerElementen();
MaakElementen();