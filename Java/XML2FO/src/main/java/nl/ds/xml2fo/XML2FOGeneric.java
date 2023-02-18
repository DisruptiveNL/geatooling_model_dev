/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.ds.xml2fo;

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

//Java
import com.megginson.sax.XMLWriter;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Reader;
import java.io.StringReader;
import java.io.StringWriter;
import java.io.Writer;
import java.net.URL;
import java.util.List;
import java.util.Stack;
import javax.swing.text.Document;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;
import javax.xml.transform.OutputKeys;

//JAXP
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.TransformerException;
import javax.xml.transform.Source;
import javax.xml.transform.Result;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.sax.SAXResult;
import javax.xml.transform.sax.SAXSource;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;
import org.apache.commons.io.input.CloseShieldInputStream;
import org.apache.commons.io.input.TeeInputStream;
import org.apache.commons.lang.StringEscapeUtils;
import org.apache.fop.apps.FOPException;
import org.apache.fop.apps.FOUserAgent;
import org.apache.fop.apps.Fop;
import org.apache.fop.apps.FopFactory;
import org.apache.fop.apps.FopFactoryBuilder;
import org.apache.fop.apps.MimeConstants;
import org.apache.fop.area.Area;
import org.apache.fop.configuration.Configuration;
import org.apache.fop.configuration.ConfigurationException;
import org.apache.fop.configuration.DefaultConfigurationBuilder;
import org.apache.fop.fo.FObj;
import org.apache.fop.layoutmgr.LayoutContext;
import org.apache.fop.layoutmgr.LayoutManager;
import org.apache.fop.layoutmgr.PageSequenceLayoutManager;
import org.apache.fop.layoutmgr.Position;
import org.apache.fop.layoutmgr.PositionIterator;
import org.apache.fop.render.RendererFactory;
import org.apache.xmlgraphics.image.loader.ImageSessionContext;
import org.apache.xmlgraphics.image.loader.impl.DefaultImageSessionContext;
import org.apache.xpath.SourceTree;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.ContentHandler;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;
import org.xml.sax.XMLReader;
import org.xml.sax.helpers.DefaultHandler;
import java.util.Properties;

/**
 * This class demonstrates the conversion of an XML file to an XSL-FO file
 * using JAXP (XSLT).
 */
public class XML2FOGeneric extends DefaultHandler {
    
    public static final String EXTENSION = ".pdf";
    private String filenaamIn = "";
    private String filenaamOut = "";
    private String baseDirStr = "";
    private File baseDir = null;
    private String outDirStr = "";
    private String configFileStr = "";
    private File outDir = null;
    private String xsltFilenaam = "";
    private String xsltFormatFilenaam = "";
    
    private File configFile = null;

    public XML2FOGeneric()
    {
        System.out.println("Version 0.0.1");

        try (InputStream input = new FileInputStream("C:\\GEAResources\\stakeholder.properties")) {

            Properties prop = new Properties();

            // load a properties file
            prop.load(input);

            // get the property value and print it out
            filenaamIn = prop.getProperty("MODEL");
            filenaamOut = prop.getProperty("FILEOUT");
            baseDirStr = prop.getProperty("FOPBASEDIR");
            baseDir = new File(baseDirStr);
            outDirStr = prop.getProperty("FOPOUTDIR");
            outDir = new File(baseDir, outDirStr);
            configFileStr = prop.getProperty("FOPCONFIGFILE");
            configFile = new File(baseDir, configFileStr);
            xsltFilenaam = prop.getProperty("XSLTFILE");
            xsltFormatFilenaam = prop.getProperty("XSLTFORMATFILE");

        } catch (IOException ex) {
            ex.printStackTrace();
        }
    }
    
    /**
     * Converts an XML file to an XSL-FO file using JAXP (XSLT).
     * @param xml the XML file
     * @param xslt the stylesheet file
     * @param fo the target XSL-FO file
     * @throws IOException In case of an I/O problem
     * @throws TransformerException In case of a XSL transformation problem
     */
    public void convertXML2FO(File xml, File xslt, File fo)
                throws IOException, TransformerException, SAXException {
        
        //Setup output
        OutputStream out = new java.io.FileOutputStream(fo);
        try {
            //Setup XSLT
            //TransformerFactory factory = TransformerFactory.newInstance();
            TransformerFactory factory = new net.sf.saxon.TransformerFactoryImpl();
            
            Transformer transformer = factory.newTransformer(new StreamSource(xslt));
            transformer.setOutputProperty(OutputKeys.INDENT, "yes");
            transformer.setOutputProperty(OutputKeys.CDATA_SECTION_ELEMENTS, "notes");

            //Setup input for XSLT transformation
            
            Source src = new StreamSource(xml);

            //Resulting SAX events (the generated FO) must be piped through to FOP
            Result res = new StreamResult(out);

            //Start XSLT transformation and FOP processing
            transformer.transform(src, res);
        } finally {
            out.close();
        }
    }
    
    public static void mainStakeholders(String[] args) throws IOException, FOPException, TransformerConfigurationException, SAXException, TransformerException, ParserConfigurationException {
         
        XML2FOGeneric e = new XML2FOGeneric();
         
         e.cleanUpFile();
        
         e.start(false);
         
         e.cleanUp();
         //e.start(true);
        
         e.fopPer();
         //File baseDir = new File("D:\\XML-FO\\");
         //File outDir = new File(baseDir, "fop-1.1\\tutorial");
         //outDir.mkdirs();

         //File xmlfile = null;
         //File xsltfile = new File(outDir, "xsl\\empty.xslt");
         //File fofile = null;
         //fofile = new File(outDir, "xml\\"+naam+"_2.max.xml");
         //e.convertMax(null, xsltfile, fofile);
     }

    /**
     * Main method.
     * @param args command-line arguments
     */
    public void start(boolean makefo) {
        try {
            System.out.println("FOP ExampleXML2FO\n");
            System.out.println("Preparing...");

            //Setup directories
            File xmlfile = null;
            File xsltfile = null;
            File fofile = null;
            
            //Setup input and output files
            //boolean makefo = false;
            boolean test = false;
            
            xmlfile = new File(outDir, "xml\\cleaned\\"+filenaamIn+".max.xml");
            xsltfile = new File(outDir, "xsl\\"+xsltFilenaam);
            fofile = new File(outDir, "html\\"+filenaamIn+".html");
            
            if (makefo)
            {
                if (test)
                {    
                    xmlfile = new File(outDir, "html\\Sampler.html");
                    xsltfile = new File(outDir, "xhtml2fo.xsl");
                    fofile = new File(outDir, "fo\\"+filenaamIn+".fo");
                }else
                {    
                    xmlfile = new File(outDir, "html\\cleaned\\"+filenaamIn+".html");
                    xsltfile = new File(outDir, "xhtml2fo-primtable.xsl");
                    fofile = new File(outDir, "fo\\"+filenaamIn+".fo");
                }
            }

            System.out.println("Input: XML (" + xmlfile + ")");
            System.out.println("Stylesheet: " + xsltfile);
            System.out.println("Output: XSL-FO (" + fofile + ")");
            System.out.println();
            System.out.println("Transforming...");

            ExampleXML2FO app = new ExampleXML2FO();
            System.out.println("XML: "+xmlfile);
            System.out.println("XSLT: "+xsltfile);
            System.out.println("FO: "+fofile);
            app.convertXML2FO(xmlfile, xsltfile, fofile);
            
            /*if (!makefo)
            {
                cleanUp();
            }*/

            System.out.println("Success!");
        } catch (Exception e) {
            e.printStackTrace(System.err);
            System.exit(-1);
        }
    }
    
    
    public void fopPer() throws IOException, FOPException, TransformerConfigurationException, SAXException
    {
            //File file = File.createTempFile("" + System.currentTimeMillis(), EXTENSION);
            //URL url = new File(templateFilePath + PRESCRIPTION_URL).toURI().toURL();
            // creation of transform source
            //StreamSource transformSource = new StreamSource(url.openStream());
            // create an instance of fop factory
            
            String serverPath = outDir.getAbsolutePath();
            //org.apache.fop.configuration.Configuration.class.put("baseDir",serverPath);
        
            FopFactory fopFactory = null; // = FopFactory.newInstance(new File(serverPath).toURI());
            
            FopFactoryBuilder fopFactoryBuilder = new FopFactoryBuilder(new File(serverPath).toURI());
            if (configFile != null) {
               DefaultConfigurationBuilder cfgBuilder = new DefaultConfigurationBuilder();
               try {
                 Configuration cfg = cfgBuilder.buildFromFile(configFile.getAbsoluteFile());
                 fopFactoryBuilder.setConfiguration(cfg);
               } catch (ConfigurationException e) {
                 throw new IOException("Failed to use FOP configuration at " + configFile.getAbsolutePath(), e);
               }
            }
            
           
            fopFactory = fopFactoryBuilder.build();
            
            //fopFactory.setBaseURL(new File(serverPath).toURI());
            
            //fopFactory.setBaseURL(serverPath);
            // a user agent is needed for transformation
            FOUserAgent foUserAgent = fopFactory.newFOUserAgent();
            //foUserAgent.setAccessibility(true);
            foUserAgent.setLocatorEnabled(true);
            
            RendererFactory rendererFactory = fopFactory.getRendererFactory();
            rendererFactory.addDocumentHandlerMaker(new CustomPDFDocumentHandlerMaker());
        
            //foUserAgent.getRendererOptions().put("pdf-a-mode", "PDF/A-1b");
            // to store output
            ByteArrayOutputStream pdfoutStream = new ByteArrayOutputStream();
            Transformer xslfoTransformer = null;
            Fop fop;
            try {
                    fop = fopFactory.newFop(MimeConstants.MIME_PDF, foUserAgent, pdfoutStream);
                    
                    //fop.getDefaultHandler().skippedEntity("fo:table-and-caption");
                    //fop.getUserAgent().getSubject().replaceAll("table-layout=\"auto\"","table-layout=\"fixed\"");
                    
                    //fop.getUserAgent().getSubject().replaceAll("<fo:table-and-caption display-align=\"center\">","");
                    
                    //fop.getUserAgent().getSubject().replaceAll("</fo:table-and-caption>","");
                    
                    // Resulting SAX events (the generated FO)
                    // must be piped through to FOP
                    TransformerFactory factory = new net.sf.saxon.TransformerFactoryImpl();
                               
                    //File xmlfile = new File(outDir, "xml\\text.xml");
                    //File xsltfile = new File(outDir, "xhtml2fo-table.xsl");
                    File xsltFormatfile = new File(outDir, "xsl\\"+xsltFormatFilenaam);
                                        
                    File fofile = new File(outDir, "html\\cleaned\\"+filenaamIn+".html");
                    //File fofile = new File(outDir, "hello_out.fo");
                    
                    File pdffile = new File(outDir, "pdf\\"+filenaamIn+".pdf");
                    
                    Transformer transformer = factory.newTransformer(new StreamSource(xsltFormatfile));
                    transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
                    transformer.setOutputProperty(OutputKeys.METHOD, "xml");
                    transformer.setOutputProperty(OutputKeys.INDENT, "yes");
                    
                    //Setup input for XSLT transformation
                    //StreamSource source = new StreamSource(new ByteArrayInputStream(xmlSource.toByteArray()));
		    
                    Source src = new StreamSource(fofile);
                    //OutputStream out = new java.io.FileOutputStream(pdffile);
                    //Resulting SAX events (the generated FO) must be piped through to FOP
                    //Result res = new StreamResult(out);
                    
                    Result res1 = new SAXResult(fop.getDefaultHandler());

               try {                    
                    //Start XSLT transformation and FOP processing
                        transformer.transform(src, res1);
                    // Start XSLT transformation and FOP processing
                   

                        // if you want to save PDF file use the following code
                        //OutputStream outf = new java.io.FileOutputStream(pdffile);
                        //out = new java.io.BufferedOutputStream(outf);
                        OutputStream out = new java.io.FileOutputStream(pdffile);
                        out = new java.io.BufferedOutputStream(out);
                        FileOutputStream str = new FileOutputStream(pdffile);
                        str.write(pdfoutStream.toByteArray());
                        str.close();
                        out.close();

                    } catch (TransformerException e) {
                            e.printStackTrace();
                    }
            } catch (FOPException e) {
                    e.printStackTrace();
            }
    }
    
    public void cleanUpFile() throws ParserConfigurationException, SAXException, IOException, TransformerConfigurationException, TransformerException
    {
        
        /*File fXmlFile = new File(outDir, "xml\\"+filenaam_in+".max.xml");
        DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
        DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
        
        org.w3c.dom.Document doc = dBuilder.parse(fXmlFile);
        doc.getDocumentElement().normalize();
        Element root = doc.getDocumentElement();
        NodeList ques = root.getElementsByTagName("notes");
        
        for (int i=0; i<ques.getLength(); i++)
        {
            Node keynode = ques.item(i);
            Element fstElmnt = (Element) keynode;
            String str = keynode.getTextContent();
            str = str.replaceAll("<nvt>","nvt");
            if (str.indexOf("\\&") != -1)
            {
                System.out.println("-->"+str);
            }
            //str = StringEscapeUtils.escapeXml(str);
            
            keynode.setTextContent(str);
            //keynode.setTextContent("<![CDATA["+str+" ]]>");
       
        }
        
        ques = root.getElementsByTagName("tag");
        
        for (int i=0; i<ques.getLength(); i++)
        {
            Node keynode = ques.item(i);
            Element fstElmnt = (Element) keynode;
            String str = keynode.getTextContent();
            //str = StringEscapeUtils.escapeXml(str);
            //keynode.setTextContent(str);
       
        }
        
        ques = root.getElementsByTagName("name");
        
        for (int i=0; i<ques.getLength(); i++)
        {
            Node keynode = ques.item(i);
            Element fstElmnt = (Element) keynode;
            String str = keynode.getTextContent();
            str = StringEscapeUtils.escapeXml(str);
            //keynode.setTextContent(str);
       
        }
        
        Transformer transformer = TransformerFactory.newInstance().newTransformer();
        transformer.setOutputProperty(OutputKeys.INDENT, "yes");
        transformer.setOutputProperty(OutputKeys.METHOD, "xml");
        transformer.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "5");
        DOMSource source = new DOMSource(doc);
        StreamResult result = new StreamResult(new File(outDir, "xml\\cleaned\\"+filenaam_out+".max.xml"));
        transformer.transform(source, result); 
        */
        System.out.println("We gaan cleanen!");
        
        File fXmlFile = new File(baseDirStr+outDirStr+"\\xml\\"+filenaamIn+".max.xml");
        DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
        DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
        
        org.w3c.dom.Document doc = dBuilder.parse(fXmlFile);
        doc.getDocumentElement().normalize();
        Element root = doc.getDocumentElement();
        NodeList ques = root.getElementsByTagName("notes");
        
        for (int i=0; i<ques.getLength(); i++)
        {
            Node keynode = ques.item(i);
            Element fstElmnt = (Element) keynode;
            String str = keynode.getTextContent();
            //System.out.println("STR>>>"+str);
            if (str.indexOf("&lt;nvt&gt;") != -1)
            {
                System.out.println("nvt -->"+str);
                str = str.replaceAll("&lt;nvt&gt;","nvt");
                System.out.println("nvt --<"+str);
                keynode.setTextContent(str);
            }
            if (str.indexOf("<nvt>") != -1)
            {
                System.out.println("nvt -->"+str);
                str = str.replaceAll("<nvt>","nvt");
                System.out.println("nvt --<"+str);
                keynode.setTextContent(str);
            }
            if (str.indexOf("&") != -1)
            {
                
                System.out.println("-->"+str);
                str = str.replaceAll("&","en");
                System.out.println("--<"+str);
                keynode.setTextContent(str);  
            }
            //str = StringEscapeUtils.escapeXml(str);
            
            //keynode.setTextContent(str);
            //keynode.setTextContent("<![CDATA[ "+str+" ]]>");
       
        }
        
        ques = root.getElementsByTagName("tag");
        
        for (int i=0; i<ques.getLength(); i++)
        {
            Node keynode = ques.item(i);
            Element fstElmnt = (Element) keynode;
            String str = keynode.getTextContent();
            str = StringEscapeUtils.escapeXml(str);
            //keynode.setTextContent(str);
       
        }
        
        ques = root.getElementsByTagName("name");
        
        for (int i=0; i<ques.getLength(); i++)
        {
            Node keynode = ques.item(i);
            Element fstElmnt = (Element) keynode;
            String str = keynode.getTextContent();
            str = StringEscapeUtils.escapeXml(str);
            //keynode.setTextContent(str);
       
        }
        
        
        //Element quest = doc.createElement("quest");
        //quest.setAttribute("ans","3");
        //Node ques = doc.createElement("question");
        //quest.appendChild(ques);
        //quest.appendChild(doc.createTextNode("your content"));
        //quest.appendChild(doc.createTextNode("your content"));
        //root.appendChild(fstElmnt);
        Transformer transformer = TransformerFactory.newInstance().newTransformer();
        transformer.setOutputProperty(OutputKeys.INDENT, "yes");
        transformer.setOutputProperty(OutputKeys.METHOD, "xml");
        transformer.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "5");
        String fileout = baseDirStr+outDirStr+"\\xml\\cleaned\\"+filenaamIn+".max.xml";
        System.out.println("---***> "+fileout);
        DOMSource source = new DOMSource(doc);
        StreamResult result = new StreamResult(new FileOutputStream(fileout));
        transformer.transform(source, result); 
    
    }
    
    /**
     * Main method.
     * @param args command-line arguments
     */
    public void cleanUp() {
        try {
            System.out.println("FOP ExampleXML2FO\n");
            System.out.println("Preparing...");

            //Setup directories
            outDir.mkdirs();

            File xmlfile = null;
            File xsltfile = null;
            File fofile = null;
            
            //Setup input and output files
            xmlfile = new File(outDir, "html\\"+filenaamIn+".html");
            xsltfile = new File(outDir, "xsl\\empty.xslt");
            fofile = new File(outDir, "html\\cleaned\\"+filenaamIn+".html");
            
            System.out.println("Input: XML (" + xmlfile + ")");
            System.out.println("Stylesheet: " + xsltfile);
            System.out.println("Output: XSL-FO (" + fofile + ")");
            System.out.println();
            System.out.println("Transforming...");

            ExampleXML2FO app = new ExampleXML2FO();
            app.convertXML2FO(xmlfile, xsltfile, fofile);

            System.out.println("Success!");
        } catch (Exception e) {
            e.printStackTrace(System.err);
            System.exit(-1);
        }
    }
    
   
}
