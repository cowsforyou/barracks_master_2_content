function EndBuildingHelper()
{
    state = 'disabled'
    if (modelParticle !== undefined){
         Particles.DestroyParticleEffect(modelParticle, true)
    }
    if (propParticle !== undefined){
         Particles.DestroyParticleEffect(propParticle, true)
    }
    if (rangeOverlay !== undefined){
        Particles.DestroyParticleEffect(rangeOverlay, true)
    }
    for (var i in gridParticles) {
        Particles.DestroyParticleEffect(gridParticles[i], true)
    }
    for (var i in overlayParticles) {
        Particles.DestroyParticleEffect(overlayParticles[i], true)
    }
}