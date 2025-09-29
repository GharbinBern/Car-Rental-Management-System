from fastapi import HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import logging
import traceback
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ErrorHandlingMiddleware(BaseHTTPMiddleware):
	async def dispatch(self, request, call_next):
		try:
			response = await call_next(request)
			return response
		except HTTPException as http_exc:
			# Log HTTP exceptions
			logger.warning(f"HTTP Exception: {http_exc.status_code} - {http_exc.detail}")
			return JSONResponse(
				status_code=http_exc.status_code,
				content={
					"error": True,
					"message": http_exc.detail,
					"status_code": http_exc.status_code,
					"timestamp": datetime.now().isoformat(),
				},
			)
		except Exception as exc:
			# Log unexpected exceptions
			logger.error(f"Unexpected error: {str(exc)}")
			logger.error(f"Traceback: {traceback.format_exc()}")

			return JSONResponse(
				status_code=500,
				content={
					"error": True,
					"message": "Internal server error occurred",
					"status_code": 500,
					"timestamp": datetime.now().isoformat(),
					"details": str(exc) if logger.level == logging.DEBUG else None,
				},
			)


def create_error_response(status_code: int, message: str, details: str = None):
	"""Create a standardized error response"""
	return JSONResponse(
		status_code=status_code,
		content={
			"error": True,
			"message": message,
			"status_code": status_code,
			"timestamp": datetime.now().isoformat(),
			"details": details,
		},
	)


def create_success_response(data, message: str = "Success"):
	"""Create a standardized success response"""
	return {
		"error": False,
		"message": message,
		"data": data,
		"timestamp": datetime.now().isoformat(),
	}
