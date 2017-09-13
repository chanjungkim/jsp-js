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
<%@ include file="/lib/foot.jsp" %>