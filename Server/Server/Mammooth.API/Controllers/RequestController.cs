using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Mammooth.Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Mammooth.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RequestController : Controller
    {
        private readonly IRequestService _requestService;

        public RequestController(IRequestService requestService)
        {
            _requestService = requestService;
        }

        [HttpGet("GetAvailableCamps")]
        public async Task<IActionResult> GetAvailableCamps()
        {
            var camps = await _requestService.GetAvailableCampsAsync();
            return Ok(camps);
        }

        [HttpGet("GetCampById/{id}")]
        public async Task<IActionResult> GetCampById(string id)
        {
            var camp = await _requestService.GetCampByIdAsync(id);
            if (camp == null)
                return NotFound(new { message = "Camp not found" });

            return Ok(camp);
        }
    }
}