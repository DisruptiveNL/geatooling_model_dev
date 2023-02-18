/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package nl.ds.xml2fo;

import org.apache.fop.render.intermediate.IFContext;
import org.apache.fop.render.intermediate.IFDocumentHandlerConfigurator;
import org.apache.fop.render.pdf.PDFDocumentHandler;
import org.apache.fop.render.pdf.PDFRendererConfig.PDFRendererConfigParser;

/**
 *
 * @author bvdve
 */
public class CustomPDFDocumentHandler extends PDFDocumentHandler {

    public CustomPDFDocumentHandler(IFContext context) {
        super(context);
    }

    @Override
    public IFDocumentHandlerConfigurator getConfigurator() {
        return new CustomPDFRendererConfigurator(getUserAgent(), new PDFRendererConfigParser());
    }

}
