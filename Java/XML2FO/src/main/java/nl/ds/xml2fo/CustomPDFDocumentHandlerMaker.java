/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.ds.xml2fo;

import org.apache.fop.apps.FOUserAgent;
import org.apache.fop.render.intermediate.IFContext;
import org.apache.fop.render.intermediate.IFDocumentHandler;
import org.apache.fop.render.pdf.PDFDocumentHandlerMaker;

/**
 *
 * @author bvdve
 */
public class CustomPDFDocumentHandlerMaker extends PDFDocumentHandlerMaker {

    @Override
    public IFDocumentHandler makeIFDocumentHandler(IFContext ifContext) {
        CustomPDFDocumentHandler handler = new CustomPDFDocumentHandler(ifContext);
        FOUserAgent ua = ifContext.getUserAgent();
        if (ua.isAccessibilityEnabled()) {
            ua.setStructureTreeEventHandler(handler.getStructureTreeEventHandler());
        }
        return handler;
    }

}
