<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="template" tagdir="/tags/templates" %>
<%@ attribute name="pageCss" required="false" fragment="true" %>

<html>
    <head>
        <title><%=pageTitle%></title>
        <jsp:invoke fragment="pageCss" />
    </head>
    <body>
        <nav>
            <ul>
                <li><a href="#">Home</a></li>
                <li><a href="#">News</a></li>
                <li><a href="#">About</a></li>
            </ul>
        </nav>

        <jsp:doBody />

        <footer>
            <p>
                Footer
            </p>
        </footer>
    </body>
</html>
