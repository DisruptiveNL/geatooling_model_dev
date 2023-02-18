!INC Local Scripts.EAConstants-JScript

/**************************************************************************************************
 *
 * Script Name: Verwijder dubbele geaids
 * Author:      Ben van der Veen - Disruptive Solutions
 * Purpose:     Verwijder vanuit een package de elementen met dubbele geaid
 * LET OP :     Is op Package niveau!!!
 *
 * Created:     November 2021
 * Updated:     November 2021
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

/**************************************************************************************************
 *
 * Main entry function
 *
 **************************************************************************************************/

function VerwijderDubbeleGEAIDS()
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
			var tagobj as EA.TaggedValue;
			thePackage = Repository.GetTreeSelectedObject();
			if (thePackage.Packages) 
			{
	
				var uitsprakenCounter = 0;
				var geaid_teller = 0;
				var geaid_teller_arr = [];
				
				for (var index = 0; index < thePackage.Elements.Count; index++)
				{
				
					var elem as EA.Element;
					elem = thePackage.Elements.GetAt(index);
					
					var aantalTaggedValues = elem.TaggedValues().Count;
					
					//Session.Output( "Aantal->"  +aantalTaggedValues );
					
						
					for (var index2 = 0; index2 < elem.TaggedValues.Count; index2++)
					{
						tagobj = elem.TaggedValues.GetAt(index2);
						
						if (tagobj.Name == "geaid")
						{
							
							geaid_teller_arr[geaid_teller] = index2;
							geaid_teller++;
							//if(tagval.Value != "")
							//{	
								//Session.Output( geaid_teller+ "-" +elem.ElementID +":"+ elem.Stereotype +"] Tagv->"  +tagval.PropertyID +":"+ tagval.Name + " Val->" + tagval.Value );
							//}
						}
					
					//if ( typeVormgeving == typeStereotypeFrm )
					//{
					
						//Session.Output( tagv );
						
						//elem.Stereotype = typeStereotypeTo
						//elem.Update();
						
						uitsprakenCounter++;
					}
					//Session.Output( "Aantal geaids "  + geaid_teller_arr.length);
					
					if (geaid_teller > 1)
					{
						Session.Output( "ID removed"  + geaid_teller_arr[0]+"--"+tagobj.ElementID);
						elem.TaggedValues.Delete(geaid_teller_arr[0]);
						elem.Update();
					}
					geaid_teller = 0;
					Session.Output( "-------\n");
						
					
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

//Veranderstereotype("RichtinggevendeUitspraak", "Uitspraak");
VerwijderDubbeleGEAIDS();	// TODO: Enter script code here