using Mammooth.Common.Requests.User;
using Mammooth.Common.Requests.Camps;
using Mammooth.Domain.DTOs;
using Mammooth.Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Mammooth.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class Admin(IAdminService adminService) : Controller
    {
        private readonly IAdminService _adminService = adminService;
        [HttpPost("AddCamp")]
        public async Task<IActionResult> AddCamp([FromBody] CreateCampRequest request)
        {
            var result = await _adminService.AddCamp(request);
            if (result.Success)
                return Ok(new { success = true, message = result.Message });

            return BadRequest(new { success = false, message = result.Message });
        }
        [HttpDelete("DeleteCamp/{id}")]
        public async Task<IActionResult> DeleteCamp(string id)
        {
            var result = await _adminService.DeleteCamp(id);
            if (result.Success)
                return Ok(new { success = true, message = result.Message });

            return BadRequest(new { success = false, message = result.Message });
        }
        [HttpPut("UpdateCamp/{id}")]
        public async Task<IActionResult> UpdateCamp(string id, [FromBody] CampUpdateModel request)
        {
            var result = await _adminService.UpdateCamp(id, request);
            if (result.Success)
                return Ok(new { success = true, message = result.Message });

            return BadRequest(new { success = false, message = result.Message });
        }
        [HttpGet("GetAllCampEnquieries")]
        public async Task<IActionResult> GetAllCampEnquieries()
        {
            var (success, message, data) = await _adminService.GetAllCampEnquieries();

            if (!success)
            {
                return BadRequest(new { success = false, message });
            }

            return Ok(new { success = true, message, data });
        }
        [HttpPost("AddUser")]
        public async Task<IActionResult> AddUser([FromBody] CreateUserRequest request)
        {
            var result = await _adminService.AddUser(request);
            if (result.Success)
                return Ok(new { success = true, message = result.Message });

            return BadRequest(new { success = false, message = result.Message });
        }
        [HttpDelete("DeleteUser/{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var result = await _adminService.DeleteUser(id);
            if (result.Success)
                return Ok(new { success = true, message = result.Message });

            return BadRequest(new { success = false, message = result.Message });
        }
        [HttpPut("UpdateUser/{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UserUpdateModel request)
        {
            var result = await _adminService.UpdateUser(id, request);
            if (result.Success)
                return Ok(new { success = true, message = result.Message });

            return BadRequest(new { success = false, message = result.Message });
        }
        [HttpGet("GetAllUserEnquieries")]
        public async Task<IActionResult> GetAllUserEnqueries()
        {
            var (success, message, data) = await _adminService.GetAllUserEnqueries();

            if (!success)
            {
                return BadRequest(new { success = false, message });
            }

            return Ok(new { success = true, message, data });
        }
        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            try
            {
                var stats = await _adminService.GetDashboardStatsAsync();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [HttpGet("GetAllReviews")]
        public async Task<IActionResult> GetAllReviews()
        {
            try
            {
                var (success, message, data) = await _adminService.GetAllReviews();
                if (!success)
                    return BadRequest(new { message });

                return Ok(new { success = true, data });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}