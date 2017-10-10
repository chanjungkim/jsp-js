<%@ tag language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="template" tagdir="/tags/templates" %>
<%@ attribute name="pageCss" required="false" fragment="true" %>
<%@ attribute name="pageTitle" required="false" rtexprvalue="true" %>

<template:layout pageTitle="blah">
    <jsp:attribute name="pageCss">
        <style>
            h1 {
                color: blue;
            }
        </style>
    </jsp:attribute>

    <jsp:body>
        <h1>Blah blah</h1>
        <p>
            Yadda yadda yadda yadda yadda yadda yadda,
            yadda yadda yadda yadda yadda yadda,
            yadda yadda yadda.
        </p>
    </jsp:body>
</template:layout>
