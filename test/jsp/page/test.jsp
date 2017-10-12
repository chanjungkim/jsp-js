<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="s" uri="/struts-tags" %>
<%@ include file="/lib/head.jsp" %>
<div id="container">
	<bob:stuff></bob:stuff>
	<c:if test="success == true">
		<p class="tip-success">Action success!</p>
	</c:if>
	<c:if test="!success && errorMessage">
		<p class="tip-fail">${errorMessage}</p>
	</c:if>

	<c:choose>
		<c:when test="x == 1">
			<p>Yadda</p>
		</c:when>
		<c:when test="x == 2">
			<p>Blah blah</p>
		</c:when>
		<c:otherwise>
			<p>Nothing</p>
		</c:otherwise>
	</c:choose>

	<ul>
		<c:forEach items="${sweets}" var="sweet">
			<li>${sweet}</li>
		</c:forEach>
	</ul>

	<c:set value="blah" var="thing" />
	<h2>I say <em>${thing}</em></h2>

	<form action="${form.action}" method="post">
		<p>
			User Name:<br>
			<input id="userName" type="text" placeholder="user name" value="${form.userName}">
		</p>
		<p>
			User Email:<br>
			<input id="userEmail" type="text" placeholder="user email" value="${form.userEmail}">
		</p>
		<p>
			<button type="submit">Save</button>
		</p>
	</form>
</div>
<%@ include file="/layout/footer.jsp" %>